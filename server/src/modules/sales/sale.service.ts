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
  totalDescuento: number
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

      // 3. Calcular subtotales, descuentos e impuestos CONSISTENTE con createSimpleSale
      let subtotalBruto = 0 // Precio total SIN descuentos ($5.00)
      let subtotalNeto = 0 // Precio total CON descuentos ($2.50)
      let totalTax = 0 // Impuestos sobre neto ($0.375)
      let totalDiscountAmount = 0 // Total descuentos ($2.50)

      // Primer paso: calcular subtotal bruto y descuentos totales
      createSaleDto.items.forEach((item) => {
        const product = productMap.get(item.productId)!
        const itemSubtotal = product.pricePublic * item.quantity
        const itemDiscount =
          item.discountAmount ||
          (itemSubtotal * (item.discountPercentage || 0)) / 100
        subtotalBruto += itemSubtotal
        totalDiscountAmount += itemDiscount
      })

      // Calcular subtotal neto
      subtotalNeto = subtotalBruto - totalDiscountAmount

      // Segundo paso: calcular impuestos sobre el subtotal DESPUÉS de descuentos
      createSaleDto.items.forEach((item) => {
        const product = productMap.get(item.productId)!
        const itemSubtotal = product.pricePublic * item.quantity
        const itemDiscount =
          item.discountAmount ||
          (itemSubtotal * (item.discountPercentage || 0)) / 100
        const itemSubtotalConDescuento = itemSubtotal - itemDiscount
        // Calcular impuesto sobre el subtotal CON descuento (con redondeo)
        const itemTax =
          Math.round(itemSubtotalConDescuento * (product.tax || 0) * 100) /
          10000
        totalTax += itemTax
      })

      // 4. DEFINIR VARIABLES PARA BD
      const baseImponible = subtotalNeto // Base imponible es el neto para SRI ($2.50)
      const total = subtotalNeto + totalTax // Total final ($2.875)

      const totalItems = createSaleDto.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      )

      // 5. Procesar items con descuentos (CONSISTENTE)
      const enrichedItems = createSaleDto.items.map((item) => {
        const product = productMap.get(item.productId)!
        const itemSubtotalSinDescuento = product.pricePublic * item.quantity
        const itemDiscount =
          item.discountAmount ||
          (itemSubtotalSinDescuento * (item.discountPercentage || 0)) / 100
        const itemSubtotalConDescuento = itemSubtotalSinDescuento - itemDiscount
        const itemTaxConDescuento =
          Math.round(itemSubtotalConDescuento * (product.tax || 0) * 100) /
          10000
        return {
          productId: product.id,
          productName: product.name,
          productCode: product.code,
          quantity: item.quantity,
          unitPrice: product.pricePublic,
          taxRate: product.tax || 0,
          taxAmount: itemTaxConDescuento,
          totalPrice: itemSubtotalConDescuento, // Precio sin impuesto pero con descuento
          discountAmount: itemDiscount,
          discountPercentage: item.discountPercentage || 0,
        }
      })

      // 6. Procesar múltiples métodos de pago
      const totalReceivedFromPayments = createSaleDto.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      )
      if (totalReceivedFromPayments < total) {
        throw new ConflictException(
          `El monto total recibido ($${totalReceivedFromPayments.toFixed(2)}) es menor al total de la venta ($${total.toFixed(2)}). Subtotal: $${subtotalBruto.toFixed(2)}, Descuentos: $${totalDiscountAmount.toFixed(2)}, Base imponible: $${baseImponible.toFixed(2)}, Impuestos: $${totalTax.toFixed(2)}.`,
        )
      }
      const change = totalReceivedFromPayments - total
      const paymentMethods = createSaleDto.payments.map((payment) => ({
        method: payment.method,
        amount: Number(payment.amount.toFixed(6)),
      }))

      // 7. Validar stock
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

      // 8. Obtener datos del cliente
      let fullCustomer: any = null
      try {
        const customer = await this.customerRepository.findById(
          createSaleDto.customerId,
        )
        if (!customer) throw new NotFoundException('Cliente no encontrado')
        fullCustomer = customer
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

      // 9. Validación de consumidor final para ventas mayores a $50
      const backendTotal = Number(total.toFixed(6))
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
            `No se puede realizar una venta mayor a $50.00 (Total: $${backendTotal.toFixed(6)}) a un consumidor final.`,
          )
        }
        this.logger.log('✅ Cliente validado para venta mayor a $50:', {
          customerId: fullCustomer.id,
          total: backendTotal,
          customerType: fullCustomer.customerType,
          identificationType: fullCustomer.identificationType,
        })
      }

      // 10. Obtener establishment
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

      const sale = await this.saleRepository.create(
        {
          customerId: createSaleDto.customerId,
          subtotal: Number(subtotalBruto.toFixed(6)), // Store GROSS subtotal ($5.00)
          discountAmount: Number(totalDiscountAmount.toFixed(6)),
          taxAmount: Number(totalTax.toFixed(6)),
          total: Number(total.toFixed(6)),
          totalItems,
          paymentMethods,
          receivedAmount: Number(totalReceivedFromPayments.toFixed(6)),
          change: Number(change.toFixed(6)),
          items: enrichedItems.map((item) => {
            const saleItem = new SaleItem()
            saleItem.productName = item.productName
            saleItem.productCode = item.productCode
            saleItem.quantity = item.quantity
            saleItem.unitPrice = item.unitPrice
            saleItem.taxRate = item.taxRate
            saleItem.taxAmount = item.taxAmount
            saleItem.totalPrice = Number(item.totalPrice.toFixed(6))
            saleItem.discountAmount = item.discountAmount
            saleItem.discountPercentage = item.discountPercentage
            saleItem.product = { id: item.productId } as any
            // Calcular ganancia considerando descuentos
            const product = productMap.get(item.productId)!
            const unitRevenue = product.pricePublic - product.price
            const totalRevenueBeforeDiscount = unitRevenue * item.quantity
            const adjustedRevenue = Math.max(
              totalRevenueBeforeDiscount - item.discountAmount,
              0,
            )
            saleItem.revenue = Number(adjustedRevenue.toFixed(6))
            return saleItem
          }),
          clave_acceso: null,
          estado_sri: 'PENDING',
        },
        entityManager,
      )

      // 12. Descontar stock
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

      // 13. Preparar datos para facturación
      let customerDataForBilling
      try {
        const esConsumidorFinal =
          fullCustomer.customerType === 'final_consumer' ||
          fullCustomer.identificationType === '07' ||
          !fullCustomer.identificationNumber ||
          fullCustomer.identificationNumber.trim() === '' ||
          fullCustomer.identificationNumber === '9999999999999'
        let identificacionNormalizada =
          fullCustomer.identificationNumber?.trim() || ''
        let tipoIdentificacionNormalizado =
          fullCustomer.identificationType || '07'
        let razonSocialNormalizada = ''
        if (esConsumidorFinal) {
          identificacionNormalizada = '9999999999999'
          tipoIdentificacionNormalizado = '07'
          razonSocialNormalizada = 'CONSUMIDOR FINAL'
        } else {
          razonSocialNormalizada =
            fullCustomer.firstName && fullCustomer.lastName
              ? `${fullCustomer.firstName.trim()} ${fullCustomer.lastName.trim()}`
              : fullCustomer.firstName?.trim() ||
                fullCustomer.lastName?.trim() ||
                'Sin nombre'
          tipoIdentificacionNormalizado =
            fullCustomer.identificationType || '05'
        }
        const normalizePhone = (phone: any): string => {
          if (phone === null || phone === undefined || phone === '')
            return '0999999999'
          let phoneStr = phone.toString().replace(/\D/g, '')
          if (phoneStr.startsWith('593')) phoneStr = phoneStr.substring(3)
          if (!phoneStr.startsWith('0')) phoneStr = '0' + phoneStr
          if (phoneStr.length === 9 && phoneStr.startsWith('02')) {
            phoneStr = phoneStr + '0'
          } else if (phoneStr.length > 10) {
            phoneStr = phoneStr.substring(0, 10)
          } else if (phoneStr.length < 10) {
            phoneStr = phoneStr.padEnd(10, '0')
          }
          const validPatterns = /^0[2-7]\d{8}$|^09\d{8}$/
          if (!validPatterns.test(phoneStr)) return '0999999999'
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
        customerDataForBilling = {
          tipoIdentificacion: '07',
          razonSocial: 'CONSUMIDOR FINAL',
          identificacion: '9999999999999',
          direccion: 'Ecuador',
          email: 'sin@email.com',
          telefono: '0999999999',
        }
        this.logger.warn('⚠️ Usando datos de consumidor final como fallback')
      }

      // 14. Punto de emisión
      let puntoEmision
      try {
        const puntosEmisionData = await this.billingService.getPuntosEmision()
        if (puntosEmisionData && puntosEmisionData.length > 0) {
          puntoEmision = String(
            puntosEmisionData[0].id || puntosEmisionData[0].codigo || '1',
          )
          this.logger.log(`📍 Punto de emisión: ${puntoEmision}`)
        }
      } catch (error) {
        this.logger.warn(
          '⚠️ Error al obtener puntos de emisión:',
          error.message,
        )
      }

      // 15. Factura electrónica directa con createSimpleFactura
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
        const productos = enrichedItems.map((item) => {
          const codigo = (item.productCode || item.productId).toString()
          return {
            codigo: codigo.substring(0, 25),
            descripcion: item.productName.substring(0, 300),
            cantidad: Number(item.quantity),
            precioUnitario: Number(item.unitPrice.toFixed(6)),
            ivaPorcentaje: Number(item.taxRate),
            descuento: Number(item.discountAmount.toFixed(6)),
          }
        })
        this.logger.log('📦 Productos para facturación:', productos)
        const principalPayment = createSaleDto.payments.reduce(
          (max, current) => (current.amount > max.amount ? current : max),
          createSaleDto.payments[0],
        )
        const formaPago = paymentMethodMap[principalPayment.method] || '01'
        this.logger.log(
          `💳 Forma de pago mapeada: ${principalPayment.method} -> ${formaPago} (monto: $${principalPayment.amount})`,
        )
        this.logger.log('🔄 Creando factura electrónica directamente...')
        const facturaResult = await this.billingService.createFacturaSRI(
          puntoEmision,
          customerDataForBilling,
          productos,
          formaPago,
        )
        this.logger.log('📄 Respuesta de facturación:', facturaResult)
        if (facturaResult && facturaResult.success) {
          const isProcessing =
            facturaResult.data?.estado === 'pendiente' ||
            facturaResult.data?.processing === true
          facturaResponse = {
            success: true,
            attempted: true,
            message: facturaResult.message,
            claveAcceso: facturaResult.data.claveAcceso,
            processing: isProcessing,
            comprobanteId: facturaResult.data?.comprobante_id,
            sriResponse: facturaResult,
          }
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
                  repeat: { every: 15000 },
                  jobId: `check-voucher-${sale.id}`,
                  removeOnComplete: true,
                  removeOnFail: false,
                  attempts: 5,
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
        try {
          await this.saleRepository.update(
            sale.id,
            { estado_sri: 'ERROR' },
            entityManager,
          )
        } catch (updateError) {
          this.logger.error(
            '❌ Error actualizando estado de venta:',
            updateError.message,
          )
        }
      }

      // 16. Respuesta final
      const saleWithCompleteInfo = {
        ...sale,
        customer: fullCustomer || null,
        establishment,
        billing: {
          facturaResponse: {
            success: facturaResponse.success,
            attempted: facturaResponse.attempted,
            message: facturaResponse.message,
            claveAcceso: facturaResponse.claveAcceso,
            processing: facturaResponse.processing,
            comprobanteId: facturaResponse.comprobanteId,
            sriResponse: facturaResponse.sriResponse,
          },
        },
        paymentSummary: {
          totalReceived: Number(totalReceivedFromPayments.toFixed(6)),
          change: Number(change.toFixed(6)),
          methods: paymentMethods.length,
          methodsDetails: paymentMethods,
        },
        discountSummary: {
          itemsDiscount: Number(totalDiscountAmount.toFixed(6)),
          totalDiscount: Number(totalDiscountAmount.toFixed(6)),
        },
      }

      const responseMessage = facturaResponse.success
        ? 'Venta con factura electrónica creada exitosamente'
        : facturaResponse.processing
          ? 'Venta creada, factura en proceso de autorización'
          : facturaResponse.attempted
            ? 'Venta creada, factura con errores (se intentará nuevamente)'
            : 'Venta creada sin factura electrónica'

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

      // 3. Calcular subtotales, descuentos e impuestos CORRECTAMENTE
      let subtotalBruto = 0 // Precio total SIN descuentos
      let totalTax = 0
      let totalDiscountAmount = 0

      // Primer paso: calcular subtotal bruto y descuentos totales
      createSaleDto.items.forEach((item) => {
        const product = productMap.get(item.productId)!
        const itemSubtotal = product.pricePublic * item.quantity
        const itemDiscount =
          item.discountAmount ||
          (itemSubtotal * (item.discountPercentage || 0)) / 100

        subtotalBruto += itemSubtotal
        totalDiscountAmount += itemDiscount
      })

      // Segundo paso: calcular impuestos sobre el subtotal DESPUÉS de descuentos
      createSaleDto.items.forEach((item) => {
        const product = productMap.get(item.productId)!
        const itemSubtotal = product.pricePublic * item.quantity
        const itemDiscount =
          item.discountAmount ||
          (itemSubtotal * (item.discountPercentage || 0)) / 100

        // Calcular el subtotal del item después del descuento
        const itemSubtotalConDescuento = itemSubtotal - itemDiscount

        // Calcular impuesto sobre el subtotal CON descuento (con redondeo)
        const itemTax =
          Math.round(itemSubtotalConDescuento * (product.tax || 0) * 100) /
          10000
        totalTax += itemTax
      })

      // 4. Definir variables finales para la BD
      const subtotal = subtotalBruto // 5.00 - PRECIO BRUTO para la BD
      const baseImponible = subtotalBruto - totalDiscountAmount // 2.50 - Para cálculo
      const total = baseImponible + totalTax // 2.88 - Total final

      const totalItems = createSaleDto.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      )

      // 5. Procesar items con descuentos (ACTUALIZADO)
      const enrichedItems = createSaleDto.items.map((item) => {
        const product = productMap.get(item.productId)!
        const itemSubtotalSinDescuento = product.pricePublic * item.quantity
        const itemDiscount =
          item.discountAmount ||
          (itemSubtotalSinDescuento * (item.discountPercentage || 0)) / 100

        // Calcular impuesto sobre el precio CON descuento (con redondeo)
        const itemSubtotalConDescuento = itemSubtotalSinDescuento - itemDiscount
        const itemTaxConDescuento =
          Math.round(itemSubtotalConDescuento * (product.tax || 0) * 100) /
          10000

        return {
          productId: product.id,
          productName: product.name,
          productCode: product.code,
          quantity: item.quantity,
          unitPrice: product.pricePublic,
          taxRate: product.tax || 0,
          taxAmount: itemTaxConDescuento, // CORREGIDO: impuesto después del descuento
          totalPrice: itemSubtotalConDescuento, // CORREGIDO: precio sin impuesto pero con descuento
          discountAmount: itemDiscount,
          discountPercentage: item.discountPercentage || 0,
        }
      })

      // 6. Procesar múltiples métodos de pago
      const totalReceivedFromPayments = createSaleDto.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0,
      )

      if (totalReceivedFromPayments < total) {
        throw new ConflictException(
          `El monto total recibido ($${totalReceivedFromPayments.toFixed(2)}) es menor al total de la venta ($${total.toFixed(2)}). Subtotal: $${subtotal.toFixed(2)}, Base imponible: $${baseImponible.toFixed(2)}, Impuestos: $${totalTax.toFixed(2)}.`,
        )
      }

      const change = totalReceivedFromPayments - total
      const paymentMethods = createSaleDto.payments.map((payment) => ({
        method: payment.method,
        amount: Number(payment.amount.toFixed(6)),
      }))

      // 7. Validar stock
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

      // 8. Obtener datos del cliente
      const customer = await this.customerRepository.findById(
        createSaleDto.customerId,
      )
      if (!customer) {
        throw new NotFoundException('Cliente no encontrado')
      }

      // 9. Validación de consumidor final para ventas mayores a $50
      if (total > 50) {
        const isConsumidorFinal =
          customer.customerType === 'final_consumer' ||
          customer.identificationType === '07' ||
          !customer.identificationNumber ||
          customer.identificationNumber.trim() === '' ||
          customer.identificationNumber === '9999999999999'
        if (isConsumidorFinal) {
          throw new ConflictException(
            `No se puede realizar una venta mayor a $50.00 (Total: $${total.toFixed(6)}) a un consumidor final.`,
          )
        }
      }

      // 10. Obtener establishment
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

      const sale = await this.saleRepository.create(
        {
          customerId: createSaleDto.customerId,
          subtotal: Number(subtotal.toFixed(6)), // DEBE SER 5.000000
          discountAmount: Number(totalDiscountAmount.toFixed(6)),
          taxAmount: Number(totalTax.toFixed(6)),
          total: Number(total.toFixed(6)),
          totalItems,
          paymentMethods,
          receivedAmount: Number(totalReceivedFromPayments.toFixed(6)),
          change: Number(change.toFixed(6)),
          items: enrichedItems.map((item) => {
            const saleItem = new SaleItem()
            saleItem.productName = item.productName
            saleItem.productCode = item.productCode
            saleItem.quantity = item.quantity
            saleItem.unitPrice = item.unitPrice
            saleItem.taxRate = item.taxRate
            saleItem.taxAmount = item.taxAmount
            saleItem.totalPrice = Number(item.totalPrice.toFixed(6))
            saleItem.discountAmount = item.discountAmount
            saleItem.discountPercentage = item.discountPercentage
            saleItem.product = { id: item.productId } as any

            // Calcular ganancia considerando descuentos
            const product = productMap.get(item.productId)!
            const unitRevenue = product.pricePublic - product.price
            const totalRevenueBeforeDiscount = unitRevenue * item.quantity
            const adjustedRevenue = Math.max(
              totalRevenueBeforeDiscount - item.discountAmount,
              0,
            )
            saleItem.revenue = Number(adjustedRevenue.toFixed(6))
            return saleItem
          }),
          clave_acceso: null,
          estado_sri: 'NO_ELECTRONIC',
        },
        entityManager,
      )

      // 12. Descontar stock
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

      // 13. Respuesta final
      const saleWithCompleteInfo = {
        ...sale,
        customer: customer || null,
        establishment,
        billing: {
          attempted: false,
          success: false,
          status: 'NO_ELECTRONIC',
          message: 'Venta sin facturación electrónica',
          queuedAt: null,
        },
        paymentSummary: {
          totalReceived: Number(totalReceivedFromPayments.toFixed(6)),
          change: Number(change.toFixed(6)),
          methods: paymentMethods.length,
          methodsDetails: paymentMethods,
        },
        discountSummary: {
          itemsDiscount: Number(totalDiscountAmount.toFixed(6)),
          totalDiscount: Number(totalDiscountAmount.toFixed(6)),
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
