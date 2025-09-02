import { BillingApiService } from '@/modules/factuZen/services/api.service'
import { HttpService } from '@nestjs/axios'
import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { firstValueFrom } from 'rxjs'

interface XmlApiResponse {
  success: boolean
  message: string
  data: {
    xml: string
  }
}

interface PdfApiResponse {
  success: boolean
  message: string
  data: {
    pdf?: string // PDF en base64 (opcional)
    url?: string // URL del blob (opcional)
    // Agrega esta propiedad para el caso que mencionas
    [key: string]: any // Para propiedades adicionales
  }
}

@Injectable()
export class BillingFileInvoiceService {
  private readonly logger = new Logger(BillingFileInvoiceService.name)

  constructor(
    private readonly billingApiService: BillingApiService,
    private readonly httpService: HttpService,
  ) {}

  // Obtener PDF de comprobante por clave de acceso
  async getPdf(
    clave_acceso: string,
  ): Promise<{ pdfContent: Buffer; fileName: string }> {
    try {
      this.logger.log(
        `📄 Obteniendo PDF para clave de acceso: ${clave_acceso.substring(0, 10)}...`,
      )

      // Usar makeBinaryRequest para obtener el PDF binario directamente
      const response = await this.billingApiService.makeBinaryRequest(
        `/comprobantes/${clave_acceso}/pdf`,
        {
          timeout: 15000,
          headers: {
            Accept: 'application/pdf',
            // El token se agrega automáticamente por makeBinaryRequest
          },
        },
      )

      // Obtener el nombre del archivo del header Content-Disposition
      let fileName = `comprobante_${clave_acceso}.pdf`
      const contentDisposition = response.headers?.['content-disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          fileName = filenameMatch[1]
        }
      }

      this.logger.log(`📄 PDF generado: ${fileName}`)

      return {
        pdfContent: Buffer.from(response.data),
        fileName: fileName,
      }
    } catch (error) {
      this.logger.error('❌ Error al obtener PDF:', error.message)

      let errorMessage = 'Error al generar el PDF'
      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR

      if (error instanceof HttpException) {
        throw error
      }

      if (error.response?.status) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'No autorizado - Token inválido o expirado'
            statusCode = HttpStatus.UNAUTHORIZED
            break
          case 403:
            errorMessage = 'Acceso denegado al comprobante'
            statusCode = HttpStatus.FORBIDDEN
            break
          case 404:
            errorMessage = 'Comprobante no encontrado'
            statusCode = HttpStatus.NOT_FOUND
            break
          case 409:
            errorMessage = 'Error de consulta en el SRI'
            statusCode = HttpStatus.CONFLICT
            break
          case 500:
            errorMessage = 'Error interno en la API de comprobantes'
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR
            break
          default:
            errorMessage = `Error al generar PDF: ${error.response.data?.message || error.message}`
        }
      } else {
        errorMessage = `Error al generar PDF: ${error.message}`
      }

      throw new HttpException(errorMessage, statusCode)
    }
  }

  // Método para descargar PDF desde URL blob
  private async downloadPdfFromUrl(
    url: string,
  ): Promise<{ data: Buffer; fileName: string }> {
    try {
      this.logger.log(`📥 Descargando PDF desde: ${url}`)

      // Extraer el nombre del archivo de la URL si es posible
      let fileName = 'comprobante.pdf'
      const urlMatch = url.match(/\/([^\/]+\.pdf)$/)
      if (urlMatch) {
        fileName = urlMatch[1]
      }

      // Hacer la request para descargar el PDF
      const response = await firstValueFrom(
        this.httpService.get(url, {
          responseType: 'arraybuffer',
          timeout: 15000,
        }),
      )

      return {
        data: Buffer.from(response.data),
        fileName: fileName,
      }
    } catch (error) {
      this.logger.error('❌ Error al descargar PDF desde URL:', error.message)
      throw new HttpException(
        'Error al descargar el PDF desde la URL proporcionada',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  // Obtener XML de comprobante por clave de acceso
  async getXml(
    clave_acceso: string,
  ): Promise<{ xmlContent: Buffer; fileName: string }> {
    try {
      this.logger.log(
        `📄 Obteniendo XML para clave de acceso: ${clave_acceso.substring(0, 10)}...`,
      )

      // Usar makeAuthenticatedRequest con tipado
      const response =
        await this.billingApiService.makeAuthenticatedRequest<XmlApiResponse>(
          'GET',
          `/comprobantes/${clave_acceso}/xml`,
          null,
          {
            timeout: 15000,
            headers: {
              Accept: 'application/json',
            },
          },
        )
      console.log('RESS', response)

      // Verificar la estructura de la respuesta JSON con el tipado correcto
      if (!response || !response.data || !response.data.xml) {
        this.logger.error('❌ Estructura de respuesta inválida:', response)
        throw new HttpException(
          'Estructura de respuesta inválida de la API',
          HttpStatus.INTERNAL_SERVER_ERROR,
        )
      }

      // Extraer el XML del JSON
      const xmlString = response.data.xml

      // Convertir el string XML a Buffer
      const xmlBuffer = Buffer.from(xmlString, 'utf-8')

      // Generar nombre de archivo
      const fileName = `comprobante_${clave_acceso}.xml`

      this.logger.log(
        `📄 XML generado: ${fileName}, tamaño: ${xmlBuffer.length} bytes`,
      )

      return {
        xmlContent: xmlBuffer,
        fileName: fileName,
      }
    } catch (error) {
      this.logger.error('❌ Error al obtener XML:', error.message)

      let errorMessage = 'Error al generar el XML'
      let statusCode = HttpStatus.INTERNAL_SERVER_ERROR

      // Manejar errores de HttpException
      if (error instanceof HttpException) {
        throw error
      }

      // Manejar errores de Axios/HTTP
      if (error.response?.status) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'No autorizado - Token inválido o expirado'
            statusCode = HttpStatus.UNAUTHORIZED
            break
          case 403:
            errorMessage = 'Acceso denegado al comprobante'
            statusCode = HttpStatus.FORBIDDEN
            break
          case 404:
            errorMessage = 'Comprobante no encontrado'
            statusCode = HttpStatus.NOT_FOUND
            break
          case 500:
            errorMessage = 'Error interno en la API de comprobantes'
            statusCode = HttpStatus.INTERNAL_SERVER_ERROR
            break
          default:
            errorMessage = `Error al generar XML: ${error.response.data?.message || error.message}`
        }
      } else {
        errorMessage = `Error al generar XML: ${error.message}`
      }

      throw new HttpException(errorMessage, statusCode)
    }
  }

  // Obtener tanto PDF como XML en una sola respuesta
  async getPdfAndXmlfFiles(clave_acceso: string): Promise<{
    pdf: { content: Buffer; fileName: string }
    xml: { content: Buffer; fileName: string }
  }> {
    try {
      this.logger.log(
        `📄 Obteniendo PDF y XML para clave: ${clave_acceso.substring(0, 10)}...`,
      )

      const [pdfResult, xmlResult] = await Promise.all([
        this.getPdf(clave_acceso),
        this.getXml(clave_acceso),
      ])

      this.logger.log('✅ PDF y XML obtenidos exitosamente')

      return {
        pdf: {
          content: pdfResult.pdfContent,
          fileName: pdfResult.fileName,
        },
        xml: {
          content: xmlResult.xmlContent,
          fileName: xmlResult.fileName,
        },
      }
    } catch (error) {
      this.logger.error(
        '❌ Error al obtener archivos del comprobante:',
        error.message,
      )
      throw error
    }
  }

  // Validar clave de acceso antes de generar PDF
  validateClaveAcceso(claveAcceso: string): {
    isValid: boolean
    error?: string
  } {
    if (!claveAcceso) {
      return { isValid: false, error: 'La clave de acceso es obligatoria' }
    }

    if (claveAcceso.length !== 49) {
      return {
        isValid: false,
        error: 'La clave de acceso debe tener exactamente 49 caracteres',
      }
    }

    if (!/^\d+$/.test(claveAcceso)) {
      return {
        isValid: false,
        error: 'La clave de acceso debe contener solo números',
      }
    }

    // Validar estructura básica de la clave de acceso
    const fecha = claveAcceso.substring(0, 8)
    const tipoComprobante = claveAcceso.substring(8, 10)
    const ruc = claveAcceso.substring(10, 23)

    // Validar fecha (formato DDMMAAAA)
    const dia = parseInt(fecha.substring(0, 2))
    const mes = parseInt(fecha.substring(2, 4))
    const año = parseInt(fecha.substring(4, 8))

    if (dia < 1 || dia > 31)
      return { isValid: false, error: 'Día inválido en la clave de acceso' }
    if (mes < 1 || mes > 12)
      return { isValid: false, error: 'Mes inválido en la clave de acceso' }
    if (año < 2000 || año > 2100)
      return { isValid: false, error: 'Año inválido en la clave de acceso' }

    // Validar tipo de comprobante
    const tiposValidos = ['01', '03', '04', '05', '06', '07']
    if (!tiposValidos.includes(tipoComprobante)) {
      return {
        isValid: false,
        error: 'Tipo de comprobante inválido en la clave de acceso',
      }
    }

    // Validar RUC (debe tener 13 dígitos)
    if (ruc.length !== 13)
      return { isValid: false, error: 'RUC inválido en la clave de acceso' }

    return { isValid: true }
  }

  // Obtener información desde la clave de acceso
  parseClaveAcceso(claveAcceso: string): {
    fecha: string
    tipoComprobante: string
    ruc: string
    ambiente: string
    serie: string
    numeroSecuencial: string
    codigoNumerico: string
    tipoEmision: string
    digitoVerificador: string
  } | null {
    const validation = this.validateClaveAcceso(claveAcceso)
    if (!validation.isValid) {
      return null
    }

    return {
      fecha: claveAcceso.substring(0, 8),
      tipoComprobante: claveAcceso.substring(8, 10),
      ruc: claveAcceso.substring(10, 23),
      ambiente: claveAcceso.substring(23, 24),
      serie: claveAcceso.substring(24, 27),
      numeroSecuencial: claveAcceso.substring(27, 36),
      codigoNumerico: claveAcceso.substring(36, 44),
      tipoEmision: claveAcceso.substring(44, 45),
      digitoVerificador: claveAcceso.substring(45, 49),
    }
  }

  // Obtener descripción del tipo de comprobante
  getTipoComprobanteDescription(codigo: string): string {
    const tipos: Record<string, string> = {
      '01': 'Factura',
      '03': 'Liquidación de compra',
      '04': 'Nota de crédito',
      '05': 'Nota de débito',
      '06': 'Guía de remisión',
      '07': 'Comprobante de retención',
    }

    return tipos[codigo] || 'Tipo desconocido'
  }

  // Obtener múltiples PDFs de una vez
  async getBulkPdfs(clavesAcceso: string[]): Promise<{
    successful: { claveAcceso: string; pdf: Buffer; fileName: string }[]
    failed: { claveAcceso: string; error: string }[]
  }> {
    const successful: { claveAcceso: string; pdf: Buffer; fileName: string }[] =
      []
    const failed: { claveAcceso: string; error: string }[] = []

    this.logger.log(`📄 Obteniendo ${clavesAcceso.length} PDFs en lote...`)

    // Procesar en lotes de 5 para no sobrecargar la API
    const batchSize = 5
    for (let i = 0; i < clavesAcceso.length; i += batchSize) {
      const batch = clavesAcceso.slice(i, i + batchSize)

      const promises = batch.map(async (claveAcceso) => {
        try {
          const result = await this.getPdf(claveAcceso)
          successful.push({
            claveAcceso,
            pdf: result.pdfContent,
            fileName: result.fileName,
          })
        } catch (error) {
          failed.push({
            claveAcceso,
            error: error.message,
          })
        }
      })

      await Promise.all(promises)

      // Pequeña pausa entre lotes
      if (i + batchSize < clavesAcceso.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }

    this.logger.log(
      `✅ Proceso de lote completado: ${successful.length} exitosos, ${failed.length} fallidos`,
    )

    return { successful, failed }
  }

  // Obtener estadísticas de generación de PDFs
  async getPdfStats(filters?: {
    fechaDesde?: string
    fechaHasta?: string
  }): Promise<{
    totalGenerados: number
    porTipoComprobante: { tipo: string; cantidad: number }[]
    porMes: { mes: string; cantidad: number }[]
  }> {
    try {
      this.logger.log('📊 Obteniendo estadísticas de PDFs...')

      const queryParams = new URLSearchParams()
      if (filters?.fechaDesde)
        queryParams.append('fecha_desde', filters.fechaDesde)
      if (filters?.fechaHasta)
        queryParams.append('fecha_hasta', filters.fechaHasta)

      const endpoint = `/reports/pdf-stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      const response =
        await this.billingApiService.makeAuthenticatedRequest<any>(
          'GET',
          endpoint,
        )

      this.logger.log('✅ Estadísticas de PDFs obtenidas exitosamente')
      return (
        response.data || {
          totalGenerados: 0,
          porTipoComprobante: [],
          porMes: [],
        }
      )
    } catch (error) {
      this.logger.error(
        '❌ Error al obtener estadísticas de PDFs:',
        error.message,
      )

      // Retornar datos vacíos si hay error
      return {
        totalGenerados: 0,
        porTipoComprobante: [],
        porMes: [],
      }
    }
  }
}
