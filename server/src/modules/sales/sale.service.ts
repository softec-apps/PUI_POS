import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common'
import { DataSource } from 'typeorm'

import { SaleRepository } from '@/modules/sales/infrastructure/persistence/sale.repository'
import { StockDiscountService } from '@/modules/product/managerStock.service'
import { BillingService } from '@/modules/factuZen/services/factuZen.service'
import { CustomerRepository } from '@/modules/customer/infrastructure/persistence/customer.repository'
import { ProductRepository } from '@/modules/product/infrastructure/persistence/product.repository'
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
  ) {}

  async encolarComprobante(jobData: ComprobanteJobData): Promise<string> {
    return this.dataSource.transaction(async (entityManager) => {
      try {
        await this.saleRepository.update(
          jobData.saleId,
          {
            estado_sri: 'procesando',
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

  async createSale(
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

      // 3. Calcular totales
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

      let change = 0
      if (
        createSaleDto.paymentMethod === 'cash' &&
        createSaleDto.receivedAmount
      ) {
        if (createSaleDto.receivedAmount < total) {
          throw new ConflictException(
            'El monto recibido es menor al total de la venta',
          )
        }
        change = createSaleDto.receivedAmount - total
      }

      // 4. Validar stock
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

      // 5. Crear venta
      const sale = await this.saleRepository.create(
        {
          customerId: createSaleDto.customerId,
          subtotal: Number(subtotal.toFixed(2)),
          taxRate: Number(((totalTax / subtotal) * 100).toFixed(2)) || 0,
          taxAmount: Number(totalTax.toFixed(2)),
          total: Number(total.toFixed(2)),
          totalItems,
          paymentMethod: createSaleDto.paymentMethod,
          receivedAmount: createSaleDto.receivedAmount || 0,
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
            return saleItem
          }),
          clave_acceso: null,
          estado_sri: 'PENDING',
        },
        entityManager,
      )

      // 6. Descontar stock
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

      // 7. ✅ DATOS CLIENTE CON VALIDACIONES MEJORADAS
      let customerData
      try {
        const customer = await this.customerRepository.findById(
          createSaleDto.customerId,
        )
        if (!customer) throw new NotFoundException('Cliente no encontrado')

        customerData = {
          tipoIdentificacion: customer.identificationType || '07',
          razonSocial:
            customer.firstName && customer.lastName
              ? `${customer.firstName.trim()} ${customer.lastName.trim()}`
              : customer.firstName || customer.lastName || 'CONSUMIDOR FINAL',
          identificacion: customer.identificationNumber,
          direccion: customer.address?.trim(),
          email: customer.email?.trim(),
          telefono: customer.phone?.toString,
        }

        this.logger.log('📋 Datos cliente preparados:', {
          ...customerData,
          telefono: customerData.telefono, // Log para verificar formato
        })
      } catch (error) {
        this.logger.warn('⚠️ Error al buscar datos del cliente:', error.message)
        customerData = {
          tipoIdentificacion: '07',
          razonSocial: 'CONSUMIDOR FINAL',
          identificacion: '9999999999999',
          direccion: 'Ecuador',
          email: 'sin@email.com',
          telefono: '0999999999', // ✅ TELÉFONO VÁLIDO POR DEFECTO
        }
      }

      // 8. Punto de emisión
      let puntoEmision = '1'
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

      // 9. ✅ FACTURA ELECTRÓNICA CON MEJOR MANEJO
      let facturaResponse: {
        success: boolean
        attempted: boolean
        message: string
      } | null = null

      try {
        // ✅ VALIDAR Y PREPARAR PRODUCTOS
        const productos = enrichedItems.map((item) => {
          const codigo = (item.productCode || item.productId).toString()
          return {
            codigo: codigo.substring(0, 25), // Máximo 25 caracteres
            descripcion: item.productName.substring(0, 300), // Máximo 300 caracteres
            cantidad: Number(item.quantity),
            precioUnitario: Number(Number(item.unitPrice).toFixed(2)),
            ivaPorcentaje: Number(item.taxRate),
          }
        })

        this.logger.log('📦 Productos para facturación:', productos)

        const paymentMethodMap: Record<string, string> = {
          cash: '01', // Efectivo
          credit: '20', // Otros con utilización del sistema financiero
          debit: '19', // Tarjeta de débito
          transfer: '17', // Transferencia
          check: '02', // Cheque
          credit_card: '19', // Tarjeta de débito/crédito
          digital: '01', // Efectivo (para pagos digitales)
          card: '19', // Tarjeta
          other: '01', // Otros como efectivo
        }

        const formaPago = paymentMethodMap[createSaleDto.paymentMethod] || '01'
        this.logger.log(
          `💳 Forma de pago mapeada: ${createSaleDto.paymentMethod} -> ${formaPago}`,
        )

        // ✅ ENVIAR A LA COLA
        await this.billingQueue.add(
          JOB.CREATE_VOUCHER,
          {
            puntoEmision,
            clienteData: customerData,
            productos,
            formaPago,
            saleId: sale.id,
            saleCode: sale.code,
            userId: userId,
            timestamp: new Date().toISOString(),
          },
          {
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 10000, // 10 segundos inicial
            },
            removeOnComplete: false,
            removeOnFail: false,
            delay: 0,
          },
        )

        // ✅ PROGRAMAR JOB PARA MONITOREAR ESTADO - FACTUS ZEN
        await this.billingQueue.add(
          JOB.CHECK_PENDING_VOUCHERS,
          { saleId: sale.id },
          {
            repeat: { every: 15000 },
            jobId: `check-voucher-${sale.id}`,
            removeOnComplete: true,
            removeOnFail: true,
            backoff: { type: 'exponential', delay: 30000 },
          },
        )

        this.logger.log(
          `📤 Job de factura enviado a la cola para la venta ${sale.id} (${sale.code})`,
        )

        facturaResponse = {
          success: false,
          attempted: true,
          message: 'Factura en proceso en la cola',
        }
      } catch (error) {
        this.logger.error(
          '❌ Error al enviar la factura a la cola:',
          error.message,
        )
        this.logger.error('📋 Error stack:', error.stack)

        facturaResponse = {
          success: false,
          attempted: false,
          message: `No se pudo enviar a la cola: ${error.message}`,
        }

        // ✅ ACTUALIZAR ESTADO A ERROR SI NO SE PUDO ENCOLAR
        try {
          await this.saleRepository.update(
            sale.id,
            {
              estado_sri: 'ERROR_QUEUE',
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

      // 10. ✅ RESPUESTA FINAL MEJORADA
      const saleWithBillingInfo = {
        ...sale,
        billing: {
          attempted: facturaResponse?.attempted || false,
          success: facturaResponse?.success || false,
          status: sale.estado_sri || 'PENDING',
          message: facturaResponse?.message || 'Error desconocido',
          queuedAt: facturaResponse?.attempted
            ? new Date().toISOString()
            : null,
        },
      }

      const responseMessage = facturaResponse?.success
        ? 'Venta creada exitosamente con factura electrónica'
        : facturaResponse?.attempted
          ? 'Venta creada exitosamente. Factura electrónica en proceso.'
          : 'Venta creada exitosamente. Error en facturación electrónica.'

      this.logger.log(
        `✅ Venta creada: ${sale.id} (${sale.code}) - Estado facturación: ${sale.estado_sri}`,
      )

      return createdResponse({
        resource: PATH_SOURCE.SALE,
        message: responseMessage,
        data: saleWithBillingInfo,
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

  // MÉTODO PARA REINTENTAR FACTURACIÓN FALLIDA
  async retryBilling(
    saleId: string,
    userId: string,
  ): Promise<ApiResponse<any>> {
    const sale = await this.saleRepository.findById(saleId)

    if (!sale) {
      throw new NotFoundException('Venta no encontrada')
    }

    if (sale.estado_sri === 'AUTORIZADO')
      throw new ConflictException('La venta ya tiene factura autorizada')

    try {
      // Obtener datos del cliente nuevamente
      let customerData
      try {
        const customer = await this.customerRepository.findById(sale.customerId)
        if (customer) {
          customerData = {
            tipoIdentificacion: customer.identificationType || '07',
            razonSocial:
              customer.firstName && customer.lastName
                ? `${customer.firstName.trim()} ${customer.lastName.trim()}`
                : customer.firstName || customer.lastName || 'CONSUMIDOR FINAL',
            identificacion: customer.identificationNumber || '9999999999999',
            direccion: customer.address || 'Ecuador',
            email: customer.email ? customer.email.trim() : 'sin@email.com',
            telefono: customer.phone?.toString,
          }
        } else {
          throw new Error('Cliente no encontrado')
        }
      } catch (error) {
        // Usar datos por defecto si no se encuentra el cliente
        customerData = {
          tipoIdentificacion: '07',
          razonSocial: 'CONSUMIDOR FINAL',
          identificacion: '9999999999999',
          direccion: 'Ecuador',
          email: 'sin@email.com',
          telefono: '0999999999',
        }
      }

      // Preparar productos desde los items de la venta
      const productos = sale.items.map((item) => ({
        codigo: (item.productCode || item.id).toString().substring(0, 25),
        descripcion: item.productName.substring(0, 300),
        cantidad: Number(item.quantity),
        precioUnitario: Number(Number(item.unitPrice).toFixed(2)),
        ivaPorcentaje: Number(item.taxRate),
      }))

      // Mapear método de pago
      const paymentMethodMap: Record<string, string> = {
        cash: '01',
        credit: '20',
        debit: '19',
        transfer: '17',
        check: '02',
        credit_card: '19',
        digital: '01',
        card: '19',
        other: '01',
      }
      const formaPago = paymentMethodMap[sale.paymentMethod] || '01'

      // Obtener punto de emisión
      let puntoEmision = '1'
      try {
        const puntosEmisionData = await this.billingService.getPuntosEmision()
        if (puntosEmisionData && puntosEmisionData.length > 0) {
          puntoEmision = String(
            puntosEmisionData[0].id || puntosEmisionData[0].codigo || '1',
          )
        }
      } catch (error) {
        this.logger.warn(
          '⚠️ Error al obtener puntos de emisión para retry:',
          error.message,
        )
      }

      // Usar transacción para actualizar estado a PENDING antes de reenviar
      await this.dataSource.transaction(async (manager) => {
        await this.saleRepository.update(
          saleId,
          {
            estado_sri: 'PENDING',
          },
          manager,
        )
      })

      // Reenviar a la cola
      await this.billingQueue.add(
        JOB.CREATE_VOUCHER,
        {
          puntoEmision,
          clienteData: customerData,
          productos,
          formaPago,
          saleId: sale.id,
          saleCode: sale.code,
          userId: userId,
          retry: true,
          timestamp: new Date().toISOString(),
        },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 10000 },
          removeOnComplete: false,
          removeOnFail: false,
          delay: 2000, // 2 segundos de delay para retry
        },
      )

      this.logger.log(
        `🔄 Facturación reenviada para venta ${sale.id} (${sale.code})`,
      )

      return createdResponse({
        resource: PATH_SOURCE.SALE,
        message: 'Facturación reenviada a la cola exitosamente',
        data: {
          saleId: sale.id,
          status: 'PENDING',
          retriedAt: new Date().toISOString(),
        },
      })
    } catch (error) {
      this.logger.error(
        `❌ Error al reintentar facturación para venta ${saleId}:`,
        error.message,
      )

      // Usar transacción para actualizar estado a error
      try {
        await this.dataSource.transaction(async (manager) => {
          await this.saleRepository.update(
            saleId,
            {
              estado_sri: 'ERROR_RETRY',
            },
            manager,
          )
        })
      } catch (updateError) {
        this.logger.error(
          'Error al actualizar estado después del fallo:',
          updateError.message,
        )
      }

      throw new InternalServerErrorException(
        `Error al reintentar facturación: ${error.message}`,
      )
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
