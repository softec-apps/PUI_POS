import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { BillingApiService } from '@/modules/factuZen/services/api.service'
import { CreateFacturaDto } from '@/modules/factuZen/dto/factura.dto'
import { InjectQueue } from '@nestjs/bullmq'
import { QUEUE } from '@/common/constants/queue.const'
import { InjectRepository } from '@nestjs/typeorm'
import { Sale } from '@/modules/sales/domain/sale'
import { Repository } from 'typeorm'

@Injectable()
export class BillingInvoiceService {
  @InjectQueue(QUEUE.WEBHOOK)
  private readonly logger = new Logger(BillingInvoiceService.name)

  @InjectRepository(Sale)
  private readonly saleRepository: Repository<Sale>

  constructor(private readonly billingApiService: BillingApiService) {}

  /**
   * Obtener comprobante por ID (UUID)
   */
  async getComprobanteById(comprobanteId: string): Promise<any> {
    try {
      this.logger.log(`📋 Obteniendo comprobante por ID: ${comprobanteId}`)

      const response =
        await this.billingApiService.makeAuthenticatedRequest<any>(
          'GET',
          `/api/comprobantes/byId/${comprobanteId}`,
        )

      this.logger.log('✅ Comprobante obtenido exitosamente por ID')
      return response
    } catch (error) {
      this.logger.error(
        '❌ Error al obtener comprobante por ID:',
        error.message,
      )

      if (error.response?.status === 404) {
        throw new NotFoundException(
          `Comprobante ${comprobanteId} no encontrado`,
        )
      }

      throw new HttpException(
        `Error al obtener comprobante: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  /**
   * Obtener XML de comprobante por ID (UUID)
   */
  async getComprobanteXmlById(comprobanteId: string): Promise<any> {
    try {
      this.logger.log(
        `📄 Obteniendo XML del comprobante por ID: ${comprobanteId}`,
      )

      const response =
        await this.billingApiService.makeAuthenticatedRequest<any>(
          'GET',
          `/api/comprobantes/byId/${comprobanteId}/xml`,
        )

      this.logger.log('✅ XML obtenido exitosamente por ID')
      return response
    } catch (error) {
      this.logger.error('❌ Error al obtener XML por ID:', error.message)

      if (error.response?.status === 404) {
        throw new NotFoundException(
          `Comprobante ${comprobanteId} no encontrado`,
        )
      }

      throw new HttpException(
        `Error al obtener XML: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  /**
   * Obtener PDF de comprobante por ID (UUID)
   */
  async getComprobantePdfById(comprobanteId: string): Promise<Buffer> {
    try {
      this.logger.log(
        `📄 Obteniendo PDF del comprobante por ID: ${comprobanteId}`,
      )

      const response =
        await this.billingApiService.makeAuthenticatedRequest<any>(
          'GET',
          `/api/comprobantes/${comprobanteId}/pdf`,
          null,
          { responseType: 'arraybuffer' }, // Para manejar archivos binarios
        )

      this.logger.log('✅ PDF obtenido exitosamente por ID')
      return Buffer.from(response)
    } catch (error) {
      this.logger.error('❌ Error al obtener PDF por ID:', error.message)

      if (error.response?.status === 404) {
        throw new NotFoundException(
          `Comprobante ${comprobanteId} no encontrado`,
        )
      }

      throw new HttpException(
        `Error al obtener PDF: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  /**
   * Obtener estado de comprobante por ID (UUID)
   */
  async getComprobanteEstadoById(comprobanteId?: string | null): Promise<any> {
    try {
      this.logger.log(
        `📊 Obteniendo estado del comprobante por ID: ${comprobanteId}`,
      )

      const response =
        await this.billingApiService.makeAuthenticatedRequest<any>(
          'GET',
          `/comprobantes/byId/${comprobanteId}/estado`,
        )

      // ✅ DEBUG: Verificar la estructura real de la respuesta
      this.logger.debug(
        '🔍 Respuesta cruda de la API:',
        JSON.stringify(response),
      )

      // ⚠️ IMPORTANTE: Depende de cómo esté implementado makeAuthenticatedRequest
      // Si la API devuelve { data: { success, message, data } } o directamente { success, message, data }

      // Opción 1: Si makeAuthenticatedRequest ya hace response.data
      if (response && response.success) {
        this.logger.log('✅ Estado obtenido exitosamente por ID')
        return response // Retornamos { success, message, data }
      }

      // Opción 2: Si makeAuthenticatedRequest devuelve la respuesta completa de Axios
      if (response.data && response.data.success) {
        this.logger.log('✅ Estado obtenido exitosamente por ID')
        return response.data // Retornamos { success, message, data }
      }

      // Si no coincide ninguna estructura
      this.logger.warn('⚠️ Estructura de respuesta no reconocida:', response)
      return response
    } catch (error) {
      this.logger.error('❌ Error al obtener estado por ID:', error.message)

      if (error.response?.status === 404) {
        throw new NotFoundException(
          `Comprobante ${comprobanteId} no encontrado`,
        )
      }

      throw new HttpException(
        `Error al obtener estado: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  /**
   * Reenviar webhook por ID de comprobante (UUID)
   */
  async resendWebhookById(
    comprobanteId: string,
    callbackUrl?: string,
  ): Promise<any> {
    try {
      this.logger.log(`🔄 Reenviando webhook por ID: ${comprobanteId}`)

      const response =
        await this.billingApiService.makeAuthenticatedRequest<any>(
          'POST',
          `/api/comprobantes/byId/${comprobanteId}/resend-webhook`,
          { callbackUrl },
        )

      this.logger.log('✅ Webhook reenviado exitosamente por ID')
      return response
    } catch (error) {
      this.logger.error('❌ Error al reenviar webhook por ID:', error.message)

      if (error.response?.status === 404) {
        throw new NotFoundException(
          `Comprobante ${comprobanteId} no encontrado`,
        )
      }

      throw new HttpException(
        `Error al reenviar webhook: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // Obtener puntos de emisión
  async getPuntosEmision(): Promise<any[]> {
    try {
      this.logger.log('📍 Obteniendo puntos de emisión...')

      const response =
        await this.billingApiService.makeAuthenticatedRequest<any>(
          'GET',
          '/puntos-emision',
        )

      this.logger.log(
        '📋 Respuesta puntos emisión:',
        JSON.stringify(response, null, 2),
      )

      if (response.success && response.data?.data?.length > 0) {
        this.logger.log(
          `✅ Se obtuvieron ${response.data.data.length} puntos de emisión`,
        )
        return response.data.data
      }

      this.logger.warn('⚠️ No se encontraron puntos de emisión en la respuesta')
      return []
    } catch (error) {
      this.logger.error('❌ Error al obtener puntos de emisión:', error.message)
      this.logger.error('📋 Error response:', error.response?.data)
      this.logger.error('📋 Error status:', error.response?.status)
      return []
    }
  }

  // Crear factura
  async createFactura(
    puntoEmision: string,
    facturaData: CreateFacturaDto,
  ): Promise<any> {
    try {
      this.logger.log(
        `💳 Creando factura para punto de emisión: ${puntoEmision}`,
      )
      this.logger.log('📋 Datos factura:', JSON.stringify(facturaData, null, 2))

      const response =
        await this.billingApiService.makeAuthenticatedRequest<any>(
          'POST',
          `/comprobantes/factura/${puntoEmision}`,
          facturaData,
          { timeout: 30000 },
        )

      this.logger.log('✅ Factura creada exitosamente')
      this.logger.log(
        '📋 Respuesta factura:',
        JSON.stringify(response, null, 2),
      )
      return response
    } catch (error) {
      this.logger.error('❌ Error al crear factura:', error.message)
      this.logger.error('📋 Error response:', error.response?.data)
      this.logger.error('📋 Error status:', error.response?.status)
      this.logger.error('📋 Error config URL:', error.config?.url)

      // Mejorar el mensaje de error según el status code
      let errorMessage = 'Error al crear factura'
      switch (error.response?.status) {
        case 404:
          errorMessage =
            'Ruta de facturación no encontrada - Verifica el punto de emisión'
          break
        case 422:
          errorMessage = 'Datos de factura inválidos'
          break
        case 500:
          errorMessage = 'Error interno en la API de facturación'
          break
        default:
          errorMessage = `Error al crear factura: ${error.response?.data?.message || error.message}`
      }

      throw new HttpException(
        errorMessage,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // Método helper para crear factura con datos básicos
  // Método helper para crear factura con datos básicos
  async createFacturaSRI(
    puntoEmision: string,
    clienteData: {
      tipoIdentificacion: string
      razonSocial: string
      identificacion: string
      direccion: string
      email: string
      telefono: string
    },
    productos: {
      codigo: string
      descripcion: string
      cantidad: number
      precioUnitario: number
      ivaPorcentaje: number
      descuento?: number // ✅ Cantidad en dinero
    }[],
    formaPago: string = '01',
  ): Promise<any> {
    console.log('PRODUCTOS', productos)
    this.logger.log(
      `Preparando factura simple para ${productos.length} productos`,
    )

    const now = new Date()
    const ecuadorTime = new Date(now.getTime() - 5 * 60 * 60 * 1000)
    const fechaEmision = ecuadorTime.toISOString().split('T')[0]

    this.logger.log(`📅 Fecha de emisión: ${fechaEmision}`)

    // Opciones de código porcentaje SRI según la tabla estándar
    const codigoPorcentajeIvaMap: Record<number, number> = {
      0: 0, // IVA 0%
      5: 5, // IVA 5%
      8: 8, // IVA 8%
      12: 2, // IVA 12%
      15: 4, // IVA 15%
    }

    let totalSinImpuestos = 0
    let totalDescuentos = 0

    const detalles = productos.map((producto) => {
      // Calcular subtotal sin descuento (precio original)
      const subtotalSinDescuento = Number(
        (producto.cantidad * producto.precioUnitario).toFixed(2),
      )

      // ✅ El descuento viene como cantidad en dinero
      const valorDescuento = producto.descuento || 0

      // Asegurar que el descuento no sea mayor que el subtotal
      const descuentoAplicado = Math.min(valorDescuento, subtotalSinDescuento)

      // Calcular subtotal después del descuento
      const subtotalConDescuento = Number(
        (subtotalSinDescuento - descuentoAplicado).toFixed(2),
      )

      totalSinImpuestos += subtotalConDescuento
      totalDescuentos += descuentoAplicado

      const codigoPorcentaje =
        codigoPorcentajeIvaMap[producto.ivaPorcentaje] ?? 0

      // Calcular IVA sobre el subtotal después del descuento
      const valorIVA = Number(
        (subtotalConDescuento * (producto.ivaPorcentaje / 100)).toFixed(2),
      )

      const impuestos = [
        {
          codigo: 2, // IVA
          codigoPorcentaje: codigoPorcentaje,
          tarifa: producto.ivaPorcentaje,
          baseImponible: subtotalConDescuento, // Base imponible es después del descuento
          valor: valorIVA,
        },
      ]

      return {
        codigoPrincipal: producto.codigo.toString(),
        codigoAuxiliar: producto.codigo.toString(),
        descripcion: producto.descripcion,
        cantidad: producto.cantidad,
        precioUnitario: Number(producto.precioUnitario.toFixed(2)),
        descuento: Number(descuentoAplicado.toFixed(2)),
        precioTotalSinImpuesto: Number(subtotalConDescuento.toFixed(2)),
        impuestos,
      }
    })

    totalSinImpuestos = Number(totalSinImpuestos.toFixed(2))
    totalDescuentos = Number(totalDescuentos.toFixed(2))

    // Calcular total de IVA sumando todos los impuestos de los detalles
    const totalIVA = Number(
      detalles
        .reduce((sum, detalle) => {
          const impuestosDetalle = detalle.impuestos.reduce(
            (impSum, imp) => impSum + imp.valor,
            0,
          )
          return sum + impuestosDetalle
        }, 0)
        .toFixed(2),
    )

    const importeTotal = Number((totalSinImpuestos + totalIVA).toFixed(2))

    this.logger.log(
      `💰 Totales calculados - Sin impuestos: ${totalSinImpuestos}, Descuentos: ${totalDescuentos}, IVA: ${totalIVA}, Total: ${importeTotal}`,
    )

    // Preparar totalConImpuestos para el SRI
    interface ImpuestoAgrupado {
      codigo: number
      codigoPorcentaje: number
      tarifa: number
      baseImponible: number
      valor: number
    }

    const totalConImpuestos = detalles
      .flatMap((detalle) => detalle.impuestos)
      .reduce(
        (acumulador, impuesto) => {
          const key = `${impuesto.codigoPorcentaje}-${impuesto.tarifa}`
          if (!acumulador[key]) {
            acumulador[key] = {
              codigo: impuesto.codigo,
              codigoPorcentaje: impuesto.codigoPorcentaje,
              tarifa: impuesto.tarifa,
              baseImponible: 0,
              valor: 0,
            }
          }
          acumulador[key].baseImponible += impuesto.baseImponible
          acumulador[key].valor += impuesto.valor
          return acumulador
        },
        {} as Record<string, ImpuestoAgrupado>,
      )

    const totalConImpuestosArray = Object.values(totalConImpuestos).map(
      (imp) => ({
        codigo: imp.codigo,
        codigoPorcentaje: imp.codigoPorcentaje,
        tarifa: imp.tarifa,
        baseImponible: Number(imp.baseImponible.toFixed(2)),
        valor: Number(imp.valor.toFixed(2)),
      }),
    )

    const facturaData: CreateFacturaDto = {
      fechaEmision,
      tipoIdentificacionComprador: clienteData.tipoIdentificacion,
      razonSocialComprador: clienteData.razonSocial,
      identificacionComprador: clienteData.identificacion,
      direccionComprador: clienteData.direccion,
      totalSinImpuestos: totalSinImpuestos,
      totalDescuento: totalDescuentos,
      totalConImpuestos: totalConImpuestosArray,
      importeTotal: importeTotal,
      pagos: [
        {
          formaPago,
          total: importeTotal,
        },
      ],
      detalles,
      infoAdicional: {
        email: clienteData.email,
        telefono: clienteData.telefono,
      },
    }

    this.logger.log(
      '📋 Datos de factura a enviar:',
      JSON.stringify(facturaData, null, 2),
    )

    return await this.createFactura(puntoEmision, facturaData)
  }

  /**
   * Obtener XML de comprobante por clave acceso
   */
  async getComprobanteXmlByClaveAcceso(clave_acceso: string): Promise<any> {
    try {
      this.logger.log(
        `📄 Obteniendo XML del comprobante por ID: ${clave_acceso}`,
      )

      const response =
        await this.billingApiService.makeAuthenticatedRequest<any>(
          'GET',
          `/api/comprobantes/byId/${clave_acceso}/xml`,
        )

      this.logger.log('✅ XML obtenido exitosamente por ID')
      return response
    } catch (error) {
      this.logger.error('❌ Error al obtener XML por ID:', error.message)

      if (error.response?.status === 404) {
        throw new NotFoundException(`Comprobante ${clave_acceso} no encontrado`)
      }

      throw new HttpException(
        `Error al obtener XML: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  /**
   * Obtener PDF de comprobante por clave acceso
   */
  async getComprobantePdfByClaveAcceso(clave_acceso: string): Promise<Buffer> {
    try {
      this.logger.log(
        `📄 Obteniendo PDF del comprobante por ID: ${clave_acceso}`,
      )

      const response =
        await this.billingApiService.makeAuthenticatedRequest<any>(
          'GET',
          `/api/comprobantes/${clave_acceso}/pdf`,
          null,
          { responseType: 'arraybuffer' }, // Para manejar archivos binarios
        )

      this.logger.log('✅ PDF obtenido exitosamente por ID')
      return Buffer.from(response)
    } catch (error) {
      this.logger.error('❌ Error al obtener PDF por ID:', error.message)

      if (error.response?.status === 404) {
        throw new NotFoundException(`Comprobante ${clave_acceso} no encontrado`)
      }

      throw new HttpException(
        `Error al obtener PDF: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // Método para listar facturas con filtros
  async getFacturas(filters?: {
    fechaDesde?: string
    fechaHasta?: string
    estado?: string
    cliente?: string
    page?: number
    limit?: number
  }): Promise<any> {
    try {
      this.logger.log('📄 Obteniendo lista de facturas...')

      const queryParams = new URLSearchParams()
      if (filters?.fechaDesde)
        queryParams.append('fecha_desde', filters.fechaDesde)
      if (filters?.fechaHasta)
        queryParams.append('fecha_hasta', filters.fechaHasta)
      if (filters?.estado) queryParams.append('estado', filters.estado)
      if (filters?.cliente) queryParams.append('cliente', filters.cliente)
      if (filters?.page) queryParams.append('page', filters.page.toString())
      if (filters?.limit) queryParams.append('limit', filters.limit.toString())

      const endpoint = `/comprobantes/facturas${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      const response =
        await this.billingApiService.makeAuthenticatedRequest<any>(
          'GET',
          endpoint,
        )

      this.logger.log('✅ Lista de facturas obtenida exitosamente')
      return response
    } catch (error) {
      this.logger.error('❌ Error al obtener lista de facturas:', error.message)

      throw new HttpException(
        `Error al obtener lista de facturas: ${error.response?.data?.message || error.message}`,
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async processWebhookResponse(
    saleId: string,
    webhookData: any,
  ): Promise<void> {
    try {
      this.logger.log(`📥 Procesando webhook para venta: ${saleId}`)
      this.logger.log(`📋 Datos webhook:`, JSON.stringify(webhookData, null, 2))

      // Actualizar la venta con los datos del webhook
      await this.saleRepository.update(saleId, {
        estado_sri:
          webhookData.estado || webhookData.success ? 'AUTORIZADA' : 'ERROR',
        clave_acceso:
          webhookData.clave_acceso || webhookData.comprobante_id || null,
      })

      this.logger.log(`✅ Venta ${saleId} actualizada desde webhook`)
    } catch (error) {
      this.logger.error(
        `❌ Error procesando webhook para venta ${saleId}:`,
        error.message,
      )
      throw error
    }
  }

  // Método para validar datos de factura antes de enviar
  validateFacturaData(facturaData: CreateFacturaDto): {
    isValid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    // Validar campos obligatorios
    if (!facturaData.fechaEmision)
      errors.push('Fecha de emisión es obligatoria')
    if (!facturaData.tipoIdentificacionComprador)
      errors.push('Tipo de identificación del comprador es obligatorio')
    if (!facturaData.identificacionComprador)
      errors.push('Identificación del comprador es obligatoria')
    if (!facturaData.razonSocialComprador)
      errors.push('Razón social del comprador es obligatoria')
    if (!facturaData.detalles || facturaData.detalles.length === 0)
      errors.push('Debe incluir al menos un detalle')

    // Validar totales
    if (facturaData.totalSinImpuestos < 0)
      errors.push('Total sin impuestos no puede ser negativo')
    if (facturaData.importeTotal <= 0)
      errors.push('Importe total debe ser mayor a cero')

    // Validar detalles
    facturaData.detalles?.forEach((detalle, index) => {
      if (!detalle.descripcion)
        errors.push(`Detalle ${index + 1}: Descripción es obligatoria`)
      if (detalle.cantidad <= 0)
        errors.push(`Detalle ${index + 1}: Cantidad debe ser mayor a cero`)
      if (detalle.precioUnitario < 0)
        errors.push(
          `Detalle ${index + 1}: Precio unitario no puede ser negativo`,
        )
    })

    // Validar pagos
    if (!facturaData.pagos || facturaData.pagos.length === 0) {
      errors.push('Debe incluir al menos una forma de pago')
    } else {
      const totalPagos = facturaData.pagos.reduce(
        (sum, pago) => sum + pago.total,
        0,
      )
      const diferencia = Math.abs(totalPagos - facturaData.importeTotal)
      if (diferencia > 0.01) {
        // Tolerancia de 1 centavo por redondeos
        errors.push('La suma de pagos debe coincidir con el importe total')
      }
    }

    // Validar infoAdicional si existe
    if (facturaData.infoAdicional) {
      if (facturaData.infoAdicional.telefono) {
        const telefono = facturaData.infoAdicional.telefono.toString()
        const validPhonePattern = /^0[2-7]\d{8}$|^09\d{8}$/

        if (!validPhonePattern.test(telefono)) {
          errors.push(
            'Teléfono debe tener formato válido SRI Ecuador (10 dígitos iniciando con 0)',
          )
        }
      }

      if (facturaData.infoAdicional.email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailPattern.test(facturaData.infoAdicional.email)) {
          errors.push('Email debe tener formato válido')
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }
}
