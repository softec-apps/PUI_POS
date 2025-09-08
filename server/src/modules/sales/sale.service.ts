import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common'
import { DataSource } from 'typeorm'

import { SaleRepository } from '@/modules/sales/infrastructure/persistence/sale.repository'
import { StockDiscountService } from '@/modules/product/managerStock.service'
import { BillingService } from '@/modules/factuZen/services/factuZen.service'
import { CustomerRepository } from '@/modules/customer/infrastructure/persistence/customer.repository'
import { ProductRepository } from '@/modules/product/infrastructure/persistence/product.repository'
import { EstablishmentRepository } from '@/modules/establishment/infrastructure/persistence/establishment.repository'
import { Sale } from '@/modules/sales/domain/sale'

import { CreateSaleDto } from '@/modules/sales/dto/create-sale.dto'
import { QuerySaleDto } from '@/modules/sales/dto/query-sale.dto'

import { ApiResponse } from '@/utils/types/request-response.type'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'
import { infinityPaginationWithMetadata } from '@/utils/infinity-pagination'
import {
  createdResponse,
  listResponse,
  readResponse,
} from '@/common/helpers/responseSuccess.helper'
import { SaleItem } from '@/modules/sales/domain/saleItem'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { Queue } from 'bullmq'
import { InjectQueue } from '@nestjs/bullmq'
import { JOB, QUEUE } from '@/common/constants/queue.const'
import { paymentMethodMap } from './constant/paymentMethod'

export interface ComprobanteJobData {
  saleId: string
  customerData: any
  productos: any[]
  formaPago: string
  puntoEmision: string
  total: number
  intento?: number
  maxIntentos?: number
}

@Injectable()
export class SaleService {
  private readonly logger = new Logger(SaleService.name)

  constructor(
    @InjectQueue(QUEUE.VOUCHER) private readonly billingQueue: Queue,

    private readonly dataSource: DataSource,
    private readonly saleRepository: SaleRepository,
    private readonly billingService: BillingService,
    private readonly stockDiscountService: StockDiscountService,
    private readonly customerRepository: CustomerRepository,
    private readonly productRepository: ProductRepository,
    private readonly establishmentRepository: EstablishmentRepository,
  ) {}

  async encolarComprobante(jobData: ComprobanteJobData): Promise<string> {
    return this.dataSource.transaction(async (entityManager) => {
      try {
        await this.saleRepository.update(
          jobData.saleId,
          {
            estado_sri: 'PENDING',
            clave_acceso: null,
          },
          entityManager,
        )

        const job = await this.billingQueue.add(JOB.CREATE_VOUCHER, jobData, {
          jobId: `comprobante-${jobData.saleId}-${Date.now()}`,
          attempts: jobData.maxIntentos || 5,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: false,
          removeOnFail: false,
        })

        this.logger.log(
          `📨 Comprobante encolado para sale: ${jobData.saleId}, Job ID: ${job.id}`,
        )

        return job.id || `job-${Date.now()}`
      } catch (error) {
        this.logger.error(`❌ Error encolando comprobante: ${error.message}`)

        await this.saleRepository.update(
          jobData.saleId,
          { estado_sri: 'error' },
          entityManager,
        )

        throw error
      }
    })
  }

  async createSaleSri(
    createSaleDto: CreateSaleDto,
    userId: string,
  ): Promise<ApiResponse<Sale>> {
    return this.dataSource.transaction(async (entityManager) => {
      // 1. Productos
      const productIds = createSaleDto.items.map((item) => item.productId)
      const products = await this.productRepository.findByIds(productIds)

      if (products.length !== productIds.length) {
        const foundIds = products.map((p) => p.id)
        const missingIds = productIds.filter((id) => !foundIds.includes(id))
        throw new NotFoundException(
          `Productos no encontrados: ${missingIds.join(', ')}`,
        )
      }

      // 2. Map de productos
      const productMap = new Map(products.map((p) => [p.id, p]))

      // 3. ✅ CALCULAR TOTALES EN EL BACKEND
      let subtotal = 0
      const enrichedItems = createSaleDto.items.map((item) => {
        const product = productMap.get(item.productId)!
        const itemTotal = product.pricePublic * item.quantity
        const taxAmount =
          (itemTotal * (typeof product.tax === 'number' ? product.tax : 0)) /
          100
        subtotal += itemTotal

        return {
          productId: product.id,
          productName: product.name,
          productCode: product.code,
          quantity: item.quantity,
          unitPrice: product.pricePublic,
          taxRate: product.tax || 0,
          totalPrice: itemTotal + taxAmount,
        }
      })

      const totalTax = enrichedItems.reduce(
        (sum, item) => sum + (item.totalPrice - item.unitPrice * item.quantity),
        0,
      )
      const total = subtotal + totalTax
      const totalItems = createSaleDto.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      )

      this.logger.log('💰 Totales calculados en backend:', {
        subtotal: Number(subtotal.toFixed(2)),
        tax: Number(totalTax.toFixed(2)),
        total: Number(total.toFixed(2)),
        totalItems,
        source: 'backend_calculation',
      })

      // 4. ✅ VALIDAR TOTALES FRONTEND VS BACKEND
      const frontendTotal = createSaleDto.financials.total
      const backendTotal = Number(total.toFixed(2))
      const tolerance = 0.0

      if (Math.abs(frontendTotal - backendTotal) > tolerance) {
        this.logger.error('❌ Discrepancia en totales:', {
          frontend: {
            subtotal: createSaleDto.financials.subtotal,
            tax: createSaleDto.financials.tax,
            total: frontendTotal,
            totalItems: createSaleDto.financials.totalItems,
          },
          backend: {
            subtotal: Number(subtotal.toFixed(2)),
            tax: Number(totalTax.toFixed(2)),
            total: backendTotal,
            totalItems,
          },
          difference: Math.abs(frontendTotal - backendTotal),
        })

        throw new ConflictException(
          `Discrepancia en totales detectada. Por favor, inicia una nueva venta`,
        )
      }

      // 5. ✅ OBTENER DATOS DEL CLIENTE
      let fullCustomer: any = null
      try {
        const customer = await this.customerRepository.findById(
          createSaleDto.customerId,
        )

        if (!customer) throw new NotFoundException('Cliente no encontrado')

        fullCustomer = customer as any

        this.logger.log('👤 Cliente obtenido:', {
          id: customer.id,
          name:
            customer.firstName && customer.lastName
              ? `${customer.firstName} ${customer.lastName}`
              : customer.firstName || customer.lastName || 'Sin nombre',
          email: customer.email || 'Sin email',
          customerType: customer.customerType,
          identificationType: customer.identificationType,
        })
      } catch (error) {
        this.logger.error('❌ Error obteniendo cliente:', error.message)
        throw new NotFoundException(
          `Error al obtener cliente: ${error.message}`,
        )
      }

      // 6. ✅ VALIDACIÓN DE CONSUMIDOR FINAL PARA VENTAS MAYORES A $50 (usando total del backend)
      if (backendTotal > 50) {
        const isConsumidorFinal =
          fullCustomer.customerType === 'final_consumer' ||
          fullCustomer.identificationType === '07' ||
          !fullCustomer.identificationNumber ||
          fullCustomer.identificationNumber.trim() === '' ||
          fullCustomer.identificationNumber === '9999999999999'

        if (isConsumidorFinal) {
          this.logger.error('🚫 Venta rechazada - Consumidor final > $50:', {
            customerId: fullCustomer.id,
            customerType: fullCustomer.customerType,
            identificationType: fullCustomer.identificationType,
            total: backendTotal,
          })

          throw new ConflictException(
            `No se puede realizar una venta mayor a $50.00 (Total: $${backendTotal.toFixed(2)}) a un consumidor final.`,
          )
        }

        this.logger.log('✅ Cliente validado para venta mayor a $50:', {
          customerId: fullCustomer.id,
          total: backendTotal,
          customerType: fullCustomer.customerType,
          identificationType: fullCustomer.identificationType,
        })
      }

      // 7. Procesar múltiples métodos de pago
      const totalReceivedFromPayments = createSaleDto.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      )

      // Validar que el total recibido sea suficiente (usar total calculado en backend)
      if (totalReceivedFromPayments < backendTotal) {
        throw new ConflictException(
          `El monto total recibido ($${totalReceivedFromPayments.toFixed(2)}) es menor al total de la venta ($${backendTotal.toFixed(2)})`,
        )
      }

      // Calcular cambio
      const change = totalReceivedFromPayments - backendTotal

      // Preparar array de métodos de pago para la base de datos
      const paymentMethods = createSaleDto.payments.map((payment) => ({
        method: payment.method,
        amount: Number(payment.amount.toFixed(2)),
      }))

      // 8. Validar stock
      const stockValidations =
        await this.stockDiscountService.checkMultipleProductsStock(
          createSaleDto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        )
      const insufficientStock = stockValidations.filter((v) => !v.hasStock)
      if (insufficientStock.length > 0) {
        const errorMessages = insufficientStock
          .map(
            (stock) =>
              `${stock.productName || stock.productId}: Stock actual ${stock.currentStock}, requerido ${stock.requiredStock}`,
          )
          .join(', ')
        throw new ConflictException(`Stock insuficiente para: ${errorMessages}`)
      }

      // 9. ✅ OBTENER DATOS DEL ESTABLISHMENT
      let establishment: any = null
      try {
        const establishmentResult =
          await this.establishmentRepository.findManyWithPagination({
            filterOptions: null,
            sortOptions: null,
            paginationOptions: { page: 1, limit: 1 },
            searchOptions: null,
          })

        if (establishmentResult.data && establishmentResult.data.length > 0) {
          establishment = establishmentResult.data[0]
          this.logger.log('🏢 Establishment obtenido:', {
            id: establishment.id,
            name: establishment.name || 'N/A',
            address: establishment.address || 'N/A',
          })
        }
      } catch (error) {
        this.logger.warn('⚠️ Error al obtener establishment:', error.message)
      }

      // 10. ✅ CREAR VENTA CON TOTALES CALCULADOS EN BACKEND
      const sale = await this.saleRepository.create(
        {
          customerId: createSaleDto.customerId,
          subtotal: Number(subtotal.toFixed(2)),
          taxRate: Number(((totalTax / subtotal) * 100).toFixed(2)) || 0,
          taxAmount: Number(totalTax.toFixed(2)),
          total: Number(total.toFixed(2)), // ✅ Total del backend
          totalItems,
          paymentMethods: paymentMethods,
          receivedAmount: Number(totalReceivedFromPayments.toFixed(2)),
          change: Number(change.toFixed(2)),
          items: enrichedItems.map((item) => {
            const saleItem = new SaleItem()
            saleItem.productName = item.productName
            saleItem.productCode = item.productCode
            saleItem.quantity = item.quantity
            saleItem.unitPrice = item.unitPrice
            saleItem.taxRate = item.taxRate
            saleItem.totalPrice = item.totalPrice
            saleItem.product = { id: item.productId } as any
            // 👇 Ganancia = (precio público - precio de costo) * cantidad
            const product = productMap.get(item.productId)!
            const unitRevenue = Number(
              (product.pricePublic - product.price).toFixed(6),
            )
            saleItem.revenue = Number((unitRevenue * item.quantity).toFixed(6))

            return saleItem
          }),
          clave_acceso: null,
          estado_sri: 'PENDING',
        },
        entityManager,
      )

      // 11. Descontar stock
      const stockDiscounts = enrichedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        reason: `Venta - ${item.productCode}`,
        unitCost: item.unitPrice,
      }))

      const discountResult =
        await this.stockDiscountService.discountMultipleProducts(
          stockDiscounts,
          userId,
        )

      if (discountResult.totalFailed > 0) {
        const failedProducts = discountResult.failed
          .map((f) => `${f.productName || f.productId}: ${f.error}`)
          .join(', ')
        throw new ConflictException(
          `Error al descontar stock: ${failedProducts}`,
        )
      }

      // 12. ✅ PREPARAR DATOS PARA FACTURACIÓN (sin consultas adicionales)
      let customerDataForBilling

      try {
        // ✅ DETERMINAR SI ES CONSUMIDOR FINAL O CLIENTE ESPECÍFICO
        const esConsumidorFinal =
          fullCustomer.customerType === 'final_consumer' ||
          fullCustomer.identificationType === '07' ||
          !fullCustomer.identificationNumber ||
          fullCustomer.identificationNumber.trim() === '' ||
          fullCustomer.identificationNumber === '9999999999999'

        // ✅ NORMALIZAR IDENTIFICACIÓN SEGÚN EL TIPO DE CLIENTE
        let identificacionNormalizada =
          fullCustomer.identificationNumber?.trim() || ''
        let tipoIdentificacionNormalizado =
          fullCustomer.identificationType || '07'
        let razonSocialNormalizada = ''

        if (esConsumidorFinal) {
          // Para consumidor final, usar valores estándar
          identificacionNormalizada = '9999999999999' // 13 nueves
          tipoIdentificacionNormalizado = '07'
          razonSocialNormalizada = 'CONSUMIDOR FINAL'
        } else {
          // Para cliente específico, usar sus datos reales
          razonSocialNormalizada =
            fullCustomer.firstName && fullCustomer.lastName
              ? `${fullCustomer.firstName.trim()} ${fullCustomer.lastName.trim()}`
              : fullCustomer.firstName?.trim() ||
                fullCustomer.lastName?.trim() ||
                'Sin nombre'

          // Mantener su tipo de identificación original
          tipoIdentificacionNormalizado =
            fullCustomer.identificationType || '05'
        }

        // ✅ NORMALIZAR TELÉFONO (FUNCIÓN MEJORADA)
        const normalizePhone = (phone: any): string => {
          if (phone === null || phone === undefined || phone === '') {
            return '0999999999' // Valor por defecto válido para SRI
          }

          // Convertir a string y eliminar todo excepto dígitos
          let phoneStr = phone.toString().replace(/\D/g, '')

          // Eliminar prefijo de país si existe (+593 o 593)
          if (phoneStr.startsWith('593')) {
            phoneStr = phoneStr.substring(3)
          }

          // Asegurar que comience con 0 (requerido por SRI)
          if (!phoneStr.startsWith('0')) {
            phoneStr = '0' + phoneStr
          }

          // Validar longitud y formato según SRI Ecuador
          if (phoneStr.length === 9 && phoneStr.startsWith('02')) {
            // Teléfono fijo (02XXXXXXX) - agregar un dígito
            phoneStr = phoneStr + '0'
          } else if (phoneStr.length === 10) {
            // Verificar formatos válidos
            if (
              phoneStr.startsWith('02') || // Fijo Quito
              phoneStr.startsWith('03') || // Fijo Cuenca
              phoneStr.startsWith('04') || // Fijo Guayaquil
              phoneStr.startsWith('05') || // Fijo Ambato
              phoneStr.startsWith('06') || // Fijo Ibarra
              phoneStr.startsWith('07') || // Fijo Machala
              phoneStr.startsWith('09') // Móvil
            ) {
              return phoneStr
            }
          } else if (phoneStr.length > 10) {
            // Truncar a 10 dígitos
            phoneStr = phoneStr.substring(0, 10)
          } else if (phoneStr.length < 10) {
            // Completar con ceros a la derecha hasta llegar a 10
            phoneStr = phoneStr.padEnd(10, '0')
          }

          // Validación final - si no cumple con patrones válidos, usar default
          const validPatterns = /^0[2-7]\d{8}$|^09\d{8}$/
          if (!validPatterns.test(phoneStr)) {
            return '0999999999' // Default válido para móvil
          }

          return phoneStr
        }

        const telefonoNormalizado = normalizePhone(fullCustomer?.phone)

        customerDataForBilling = {
          tipoIdentificacion: tipoIdentificacionNormalizado,
          razonSocial: razonSocialNormalizada,
          identificacion: identificacionNormalizada,
          direccion: fullCustomer.address?.trim() || 'Ecuador',
          email: fullCustomer.email?.trim() || 'sin@email.com',
          telefono: telefonoNormalizado,
        }

        this.logger.log('📋 Datos cliente preparados:', {
          ...customerDataForBilling,
          esConsumidorFinal,
        })
      } catch (error) {
        this.logger.error(
          '❌ Error preparando datos de cliente:',
          error.message,
        )

        // ✅ SOLO USAR CONSUMIDOR FINAL COMO FALLBACK EN CASO DE ERROR REAL
        customerDataForBilling = {
          tipoIdentificacion: '07',
          razonSocial: 'CONSUMIDOR FINAL',
          identificacion: '9999999999999', // 13 dígitos
          direccion: 'Ecuador',
          email: 'sin@email.com',
          telefono: '0999999999',
        }

        this.logger.warn('⚠️ Usando datos de consumidor final como fallback')
      }

      // 13. Punto de emisión
      let puntoEmision
      try {
        const puntosEmisionData = await this.billingService.getPuntosEmision()
        if (puntosEmisionData && puntosEmisionData.length > 0) {
          puntoEmision = String(
            puntosEmisionData[0].id || puntosEmisionData[0].codigo || '1',
          )
        }
        this.logger.log(`📍 Punto de emisión: ${puntoEmision}`)
      } catch (error) {
        this.logger.warn(
          '⚠️ Error al obtener puntos de emisión:',
          error.message,
        )
      }

      // 14. ✅ FACTURA ELECTRÓNICA DIRECTA CON createSimpleFactura
      let facturaResponse: {
        success: boolean
        attempted: boolean
        message: string
        claveAcceso?: string
        facturaData?: any
        processing?: boolean
        comprobanteId?: string
        sriResponse?: any
      } = {
        success: false,
        attempted: false,
        message: 'No se intentó crear la factura',
      }

      try {
        // ✅ VALIDAR Y PREPARAR PRODUCTOS
        const productos = enrichedItems.map((item) => {
          const codigo = (item.productCode || item.productId).toString()
          return {
            codigo: codigo.substring(0, 25),
            descripcion: item.productName.substring(0, 300),
            cantidad: Number(item.quantity),
            precioUnitario: Number(Number(item.unitPrice).toFixed(2)),
            ivaPorcentaje: Number(item.taxRate),
          }
        })

        this.logger.log('📦 Productos para facturación:', productos)

        // Usar el método de pago principal (el de mayor monto)
        const principalPayment = createSaleDto.payments.reduce(
          (max, current) => (current.amount > max.amount ? current : max),
          createSaleDto.payments[0],
        )

        const formaPago = paymentMethodMap[principalPayment.method] || '01'
        this.logger.log(
          `💳 Forma de pago mapeada: ${principalPayment.method} -> ${formaPago} (monto: $${principalPayment.amount})`,
        )

        // ✅ CREAR FACTURA DIRECTAMENTE
        this.logger.log('🔄 Creando factura electrónica directamente...')

        const facturaResult = await this.billingService.createSimpleFactura(
          puntoEmision,
          customerDataForBilling,
          productos,
          formaPago,
        )

        this.logger.log('📄 Respuesta de facturación:', facturaResult)

        if (facturaResult && facturaResult.success) {
          // Caso: Factura creada exitosamente o en procesamiento
          const isProcessing =
            facturaResult.data?.estado === 'pendiente' ||
            facturaResult.data?.processing === true

          facturaResponse = {
            success: true, // ✅ SIEMPRE TRUE cuando facturaResult.success = true
            attempted: true,
            message: facturaResult.message,
            claveAcceso: facturaResult.data.claveAcceso,
            processing: isProcessing,
            comprobanteId: facturaResult.data?.comprobante_id,
            sriResponse: facturaResult,
          }

          // ✅ ACTUALIZAR VENTA CON CLAVE DE ACCESO Y ESTADO
          try {
            await this.saleRepository.update(
              sale.id,
              {
                clave_acceso: facturaResponse.claveAcceso,
                estado_sri: isProcessing ? 'PROCESANDO' : 'AUTORIZADA',
                comprobante_id: facturaResponse.comprobanteId,
              },
              entityManager,
            )
            this.logger.log(
              `✅ Venta ${sale.id} actualizada con clave de acceso: ${facturaResponse.claveAcceso}, comprobante_id: ${facturaResponse.comprobanteId}, estado: ${isProcessing ? 'PROCESANDO' : 'AUTORIZADA'}`,
            )
          } catch (updateError) {
            this.logger.error(
              '❌ Error actualizando venta con clave de acceso:',
              updateError.message,
            )
          }

          // ✅ PROGRAMAR MONITOREO SOLO SI LA FACTURA ESTÁ EN PROCESAMIENTO
          if (isProcessing && facturaResponse.comprobanteId) {
            try {
              await this.billingQueue.add(
                JOB.CHECK_PENDING_VOUCHERS,
                {
                  saleId: sale.id,
                  comprobanteId: facturaResponse.comprobanteId,
                  claveAcceso: facturaResponse.claveAcceso,
                },
                {
                  repeat: { every: 15000 }, // Cada 15 segundos
                  jobId: `check-voucher-${sale.id}`,
                  removeOnComplete: true,
                  removeOnFail: false, // ✅ No remover en fallo para retry
                  attempts: 5, // ✅ Permitir reintentos
                  backoff: { type: 'exponential', delay: 30000 },
                },
              )
              this.logger.log(
                `⏰ Job de monitoreo programado exitosamente para la venta ${sale.id} (comprobante: ${facturaResponse.comprobanteId})`,
              )
            } catch (jobError) {
              this.logger.error(
                '❌ Error programando job de monitoreo:',
                jobError.message,
              )
            }
          } else if (!isProcessing) {
            this.logger.log(
              `✅ Factura ya autorizada, no requiere monitoreo: ${sale.id}`,
            )
          } else {
            this.logger.warn(
              `⚠️ No se puede programar monitoreo, falta comprobante_id para la venta: ${sale.id}`,
            )
          }
        }
      } catch (error) {
        this.logger.error(
          '❌ Error al crear la factura directamente:',
          error.message,
        )
        this.logger.error('📋 Error stack:', error.stack)

        facturaResponse = {
          success: false,
          attempted: true,
          message: `Error al crear factura: ${error.message}`,
        }

        // ✅ ACTUALIZAR ESTADO A ERROR
        try {
          await this.saleRepository.update(
            sale.id,
            {
              estado_sri: 'ERROR',
            },
            entityManager,
          )
        } catch (updateError) {
          this.logger.error(
            '❌ Error actualizando estado de venta:',
            updateError.message,
          )
        }
      }

      // 15. ✅ RESPUESTA FINAL MEJORADA CON CUSTOMER Y ESTABLISHMENT
      const saleWithCompleteInfo = {
        ...sale,
        customer: fullCustomer || null,
        establishment: establishment,
        billing: {
          facturaResponse: {
            success: facturaResponse.success,
            attempted: facturaResponse.attempted,
            message: facturaResponse.message,
            claveAcceso: facturaResponse.claveAcceso,
            processing: facturaResponse.processing,
            comprobanteId: facturaResponse.comprobanteId,
            // Incluir todos los datos de la respuesta del SRI si están disponibles
            sriResponse: facturaResponse.sriResponse,
          },
        },
        // ✅ Información adicional de pagos
        paymentSummary: {
          totalReceived: Number(totalReceivedFromPayments.toFixed(2)),
          change: Number(change.toFixed(2)),
          methods: paymentMethods.length,
          methodsDetails: paymentMethods,
        },
      }

      const responseMessage = facturaResponse.success
        ? 'Venta con factura electrónica creada exitosamente'
        : facturaResponse.processing
          ? 'Venta creada, factura en proceso de autorización'
          : facturaResponse.attempted
            ? 'Venta creada, factura con errores (se intentará nuevamente)'
            : 'Venta creada sin factura electrónica'

      this.logger.log(
        `✅ Venta SRI creada: ${sale.id} (${sale.code}) - Total: $${total.toFixed(2)} - Cliente: ${fullCustomer?.firstName || 'N/A'} - Factura: ${facturaResponse.success ? '✅' : facturaResponse.processing ? '⏳' : '❌'}`,
      )

      // ✅ LOG COMPARATIVO DE TOTALES FRONTEND VS BACKEND
      this.logger.log('📊 Totales frontend vs backend:', {
        frontend: createSaleDto.financials,
        backend: {
          subtotal: Number(subtotal.toFixed(2)),
          tax: Number(totalTax.toFixed(2)),
          total: Number(total.toFixed(2)),
          items: totalItems,
        },
        totalPaid: totalReceivedFromPayments,
        change: Number(change.toFixed(2)),
        validation: 'PASSED',
      })

      return createdResponse({
        resource: PATH_SOURCE.SALE,
        message: responseMessage,
        data: saleWithCompleteInfo,
      })
    })
  }

  async createSimpleSale(
    createSaleDto: CreateSaleDto,
    userId: string,
  ): Promise<ApiResponse<Sale>> {
    return this.dataSource.transaction(async (entityManager) => {
      // 1. Productos
      const productIds = createSaleDto.items.map((item) => item.productId)
      const products = await this.productRepository.findByIds(productIds)

      if (products.length !== productIds.length) {
        const foundIds = products.map((p) => p.id)
        const missingIds = productIds.filter((id) => !foundIds.includes(id))
        throw new NotFoundException(
          `Productos no encontrados: ${missingIds.join(', ')}`,
        )
      }

      // 2. Map de productos
      const productMap = new Map(products.map((p) => [p.id, p]))

      // 3. ✅ CALCULAR TOTALES EN EL BACKEND
      let subtotal = 0
      const enrichedItems = createSaleDto.items.map((item) => {
        const product = productMap.get(item.productId)!
        const itemTotal = product.pricePublic * item.quantity
        const taxAmount =
          (itemTotal * (typeof product.tax === 'number' ? product.tax : 0)) /
          100
        subtotal += itemTotal

        return {
          productId: product.id,
          productName: product.name,
          productCode: product.code,
          quantity: item.quantity,
          unitPrice: product.pricePublic,
          taxRate: product.tax || 0,
          totalPrice: itemTotal + taxAmount,
        }
      })

      const totalTax = enrichedItems.reduce(
        (sum, item) => sum + (item.totalPrice - item.unitPrice * item.quantity),
        0,
      )
      const total = subtotal + totalTax
      const totalItems = createSaleDto.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      )

      // 4. ✅ VALIDAR TOTALES FRONTEND VS BACKEND
      const frontendTotal = createSaleDto.financials.total
      const backendTotal = Number(total.toFixed(2))
      const tolerance = 0.0

      if (Math.abs(frontendTotal - backendTotal) > tolerance) {
        throw new ConflictException(
          `Discrepancia en totales detectada. Por favor, inicia una nueva venta`,
        )
      }

      // 5. ✅ OBTENER DATOS DEL CLIENTE Y VALIDAR CONSUMIDOR FINAL
      const customer = await this.customerRepository.findById(
        createSaleDto.customerId,
      )

      if (!customer) {
        throw new NotFoundException('Cliente no encontrado')
      }

      // 6. ✅ VALIDACIÓN DE CONSUMIDOR FINAL PARA VENTAS MAYORES A $50
      if (backendTotal > 50) {
        const isConsumidorFinal =
          customer.customerType === 'final_consumer' ||
          customer.identificationType === '07' ||
          !customer.identificationNumber ||
          customer.identificationNumber.trim() === '' ||
          customer.identificationNumber === '9999999999999'

        if (isConsumidorFinal) {
          throw new ConflictException(
            `No se puede realizar una venta mayor a $50.00 (Total: $${backendTotal.toFixed(2)}) a un consumidor final.`,
          )
        }
      }

      // 7. Procesar múltiples métodos de pago
      const totalReceivedFromPayments = createSaleDto.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      )

      // Validar que el total recibido sea suficiente
      if (totalReceivedFromPayments < backendTotal) {
        throw new ConflictException(
          `El monto total recibido ($${totalReceivedFromPayments.toFixed(2)}) es menor al total de la venta ($${backendTotal.toFixed(2)})`,
        )
      }

      const change = totalReceivedFromPayments - backendTotal
      const paymentMethods = createSaleDto.payments.map((payment) => ({
        method: payment.method,
        amount: Number(payment.amount.toFixed(2)),
      }))

      // 8. Validar stock
      const stockValidations =
        await this.stockDiscountService.checkMultipleProductsStock(
          createSaleDto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        )
      const insufficientStock = stockValidations.filter((v) => !v.hasStock)
      if (insufficientStock.length > 0) {
        const errorMessages = insufficientStock
          .map(
            (stock) =>
              `${stock.productName || stock.productId}: Stock actual ${stock.currentStock}, requerido ${stock.requiredStock}`,
          )
          .join(', ')
        throw new ConflictException(`Stock insuficiente para: ${errorMessages}`)
      }

      // 9. Obtener establishment
      let establishment: any = null
      try {
        const establishmentResult =
          await this.establishmentRepository.findManyWithPagination({
            filterOptions: null,
            sortOptions: null,
            paginationOptions: { page: 1, limit: 1 },
            searchOptions: null,
          })

        if (establishmentResult.data && establishmentResult.data.length > 0) {
          establishment = establishmentResult.data[0]
        }
      } catch (error) {
        this.logger.warn('Error al obtener establishment:', error.message)
      }

      // 10. Crear venta simple con totales calculados en backend
      const sale = await this.saleRepository.create(
        {
          customerId: createSaleDto.customerId,
          subtotal: Number(subtotal.toFixed(2)),
          taxRate: Number(((totalTax / subtotal) * 100).toFixed(2)) || 0,
          taxAmount: Number(totalTax.toFixed(2)),
          total: Number(total.toFixed(2)), // ✅ Total del backend
          totalItems,
          paymentMethods: paymentMethods,
          receivedAmount: Number(totalReceivedFromPayments.toFixed(2)),
          change: Number(change.toFixed(2)),
          items: enrichedItems.map((item) => {
            const saleItem = new SaleItem()
            saleItem.productName = item.productName
            saleItem.productCode = item.productCode
            saleItem.quantity = item.quantity
            saleItem.unitPrice = item.unitPrice
            saleItem.taxRate = item.taxRate
            saleItem.totalPrice = item.totalPrice
            saleItem.product = { id: item.productId } as any

            // 👇 Ganancia = (precio público - precio de costo) * cantidad
            const product = productMap.get(item.productId)!
            const unitRevenue = Number(
              (product.pricePublic - product.price).toFixed(6),
            )
            saleItem.revenue = Number((unitRevenue * item.quantity).toFixed(6))

            return saleItem
          }),
          // ✅ Sin datos de facturación electrónica
          clave_acceso: null,
          estado_sri: 'NO_ELECTRONIC', // Estado que indica que no es factura electrónica
        },
        entityManager,
      )

      // 11. Descontar stock
      const stockDiscounts = enrichedItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        reason: `Venta Simple - ${item.productCode}`,
        unitCost: item.unitPrice,
      }))

      const discountResult =
        await this.stockDiscountService.discountMultipleProducts(
          stockDiscounts,
          userId,
        )

      if (discountResult.totalFailed > 0) {
        const failedProducts = discountResult.failed
          .map((f) => `${f.productName || f.productId}: ${f.error}`)
          .join(', ')
        throw new ConflictException(
          `Error al descontar stock: ${failedProducts}`,
        )
      }

      // 12. ✅ RESPUESTA FINAL CON CUSTOMER Y ESTABLISHMENT
      const saleWithCompleteInfo = {
        ...sale,
        customer: customer || null,
        establishment: establishment,
        billing: {
          attempted: false,
          success: false,
          status: 'NO_ELECTRONIC',
          message: 'Venta sin facturación electrónica',
          queuedAt: null,
        },
        paymentSummary: {
          totalReceived: Number(totalReceivedFromPayments.toFixed(2)),
          change: Number(change.toFixed(2)),
          methods: paymentMethods.length,
          methodsDetails: paymentMethods,
        },
      }

      return createdResponse({
        resource: PATH_SOURCE.SALE,
        message: 'Venta simple creada exitosamente',
        data: saleWithCompleteInfo,
      })
    })
  }

  // ÉTODO ADICIONAL PARA CONSULTAR ESTADO DE FACTURACIÓN
  async getSaleWithBilling(saleId: string): Promise<Sale & { billing?: any }> {
    const sale = await this.saleRepository.findById(saleId)

    if (!sale) {
      throw new NotFoundException('Venta no encontrada')
    }

    // ✅ ENRIQUECER CON INFORMACIÓN DE FACTURACIÓN
    const enrichedSale = {
      ...sale,
      billing: {
        hasInvoice: !!sale.clave_acceso,
        status: sale.estado_sri || 'PENDING',
        claveAcceso: sale.clave_acceso,
        isAuthorized: sale.estado_sri === 'AUTORIZADO',
        isPending: sale.estado_sri === 'PENDING',
        hasError: sale.estado_sri?.includes('ERROR'),
        statusDescription: this.getBillingStatusDescription(sale.estado_sri),
      },
    }

    return enrichedSale
  }

  // MÉTODO HELPER PARA DESCRIPCIÓN DE ESTADOS
  private getBillingStatusDescription(estado: string | null): string {
    switch (estado) {
      case 'AUTORIZADO':
        return 'Factura autorizada por el SRI'
      case 'PENDING':
        return 'Factura en proceso'
      case 'ERROR':
        return 'Error en la facturación'
      case 'ERROR_QUEUE':
        return 'Error al enviar a la cola de facturación'
      case 'DEVUELTA':
        return 'Factura devuelta por el SRI'
      case 'NO_AUTORIZADO':
        return 'Factura no autorizada por el SRI'
      default:
        return 'Estado desconocido'
    }
  }

  // Métodos de paginación y búsqueda
  async findManyWithPagination(
    query: QuerySaleDto,
  ): Promise<ApiResponse<EnhancedInfinityPaginationResponseDto<Sale>>> {
    const page = query?.page ?? 1
    let limit = query?.limit ?? 10

    // Si el límite es 9999, marcar para obtener todos los registros
    const isGetAll = limit === 9999

    if (!isGetAll && limit > 50) limit = 50

    // Si es obtener todos, usar un límite muy alto para la consulta inicial
    const queryLimit = isGetAll ? Number.MAX_SAFE_INTEGER : limit

    // Obtener datos del repositorio (sin formato)
    const { data, totalCount, totalRecords } =
      await this.saleRepository.findManyWithPagination({
        filterOptions: query?.filters,
        sortOptions: query?.sort,
        paginationOptions: {
          page: isGetAll ? 1 : page,
          limit: queryLimit,
        },
        searchOptions: query?.search,
      })

    // Para el caso de obtener todos, ajustar los parámetros de paginación
    const finalPage = isGetAll ? 1 : page
    const finalLimit = isGetAll ? totalCount : limit

    // Formatear respuesta paginada con la utilidad
    const paginatedData = infinityPaginationWithMetadata(
      data,
      {
        page: finalPage,
        limit: finalLimit,
      },
      totalCount,
      totalRecords,
    )

    return listResponse({
      data: paginatedData,
      resource: PATH_SOURCE.USER,
      message: 'Ventas obtenidas exitosamente',
    })
  }

  async findById(id: Sale['id']): Promise<ApiResponse<Sale>> {
    const sale = await this.saleRepository.findById(id)
    if (!sale)
      throw new NotFoundException({ message: 'No se pudo encontrar la venta' })

    return readResponse({
      resource: PATH_SOURCE.SALE,
      message: 'Venta obtenida exitosamente',
      data: sale,
    })
  }

  async findByIds(ids: Sale['id'][]): Promise<Sale[]> {
    return this.saleRepository.findByIds(ids)
  }

  async findByCustomerId(
    customerId: string,
  ): Promise<ApiResponse<Sale | null>> {
    const sale = await this.saleRepository.findByField('customer', customerId)
    if (!sale)
      return readResponse({
        resource: PATH_SOURCE.SALE,
        message: 'No se encontraron ventas para este cliente',
        data: null,
      })

    return readResponse({
      resource: PATH_SOURCE.SALE,
      message: 'Venta encontrada para el cliente',
      data: sale,
    })
  }
}
