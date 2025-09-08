import {
  Put,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  UseGuards,
  HttpStatus,
  Controller,
  SerializeOptions,
  UseInterceptors,
  BadRequestException,
  Req,
  Request,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Roles } from '@/modules/roles/roles.decorator'
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger'
import { RolesGuard } from '@/modules/roles/roles.guard'
import { RoleEnum, ROLES } from '@/common/constants/roles-const'
import { ApiResponse } from '@/utils/types/request-response.type'
import { PATH_SOURCE } from '@/common/constants/pathSource.const'
import { BulkProductImportService } from '@/modules/product/import.service'
import {
  BulkProductImportDto,
  BulkImportResultDto,
} from '@/modules/product/dto/import.dto'
import {
  readResponse,
  createdResponse,
} from '@/common/helpers/responseSuccess.helper'
import { FastifyRequest } from 'fastify'

// Crear un interceptor simple para Fastify
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { Observable } from 'rxjs'

@Injectable()
export class FastifyFileInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle()
  }
}

@ApiTags(`${PATH_SOURCE.PRODUCT}/bulk-import`)
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: `${PATH_SOURCE.PRODUCT}/bulk-import`,
  version: '1',
})
export class BulkProductImportController {
  constructor(private readonly bulkImportService: BulkProductImportService) {}

  /**
   * Importa productos masivamente desde un DTO JSON
   */
  @Post('json')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  async importFromJson(
    @Body() importDto: BulkProductImportDto,
    @Request() req: any,
  ): Promise<ApiResponse<BulkImportResultDto>> {
    const result = await this.bulkImportService.importProducts(
      importDto,
      req.user.id,
    )

    return createdResponse({
      resource: PATH_SOURCE.PRODUCT,
      message: `Importación completada. ${result.successCount}/${result.totalProcessed} productos procesados exitosamente`,
      data: result,
    })
  }

  /**
   * Importa productos masivamente desde un archivo XLS/XLSX
   */
  @Post('excel')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @UseInterceptors(FastifyFileInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo XLS/XLSX con productos para importar',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo XLS/XLSX con formato específico',
        },
        continueOnError: {
          type: 'boolean',
          description:
            'Continuar procesamiento aunque algunos productos fallen',
          default: false,
        },
        updateExisting: {
          type: 'boolean',
          description:
            'Actualizar productos existentes si se encuentran duplicados',
          default: false,
        },
      },
      required: ['file'],
    },
  })
  async importFromExcel(
    @Req() req: FastifyRequest | any,
  ): Promise<ApiResponse<BulkImportResultDto>> {
    try {
      if (!req.isMultipart())
        throw new BadRequestException('La request debe ser multipart/form-data')

      const parts = req.parts()
      let fileBuffer: Buffer | null = null
      const formData: any = {}

      for await (const part of parts) {
        if (part.type === 'file') {
          const chunks: Buffer[] = []
          for await (const chunk of part.file) chunks.push(chunk as Buffer)
          fileBuffer = Buffer.concat(chunks)
        } else if (part.type === 'field') {
          formData[part.fieldname] = part.value
        }
      }

      if (!fileBuffer)
        throw new BadRequestException('Archivo Excel es requerido')

      // Validar tipo de archivo
      const filename = formData.file?.filename || 'uploaded-file.xlsx'
      if (!filename.toLowerCase().match(/\.(xlsx?|xls)$/)) {
        throw new BadRequestException(
          'El archivo debe ser un Excel válido (.xls, .xlsx)',
        )
      }

      // Parsear Excel a DTO
      const importDto = await this.bulkImportService.parseExcelToImportDto(
        fileBuffer,
        {
          continueOnError: formData.continueOnError === 'true',
          updateExisting: formData.updateExisting === 'true',
          categoryId: formData.categoryId,
          brandId: formData.brandId,
          supplierId: formData.supplierId,
        },
      )

      // Ejecutar importación
      const result = await this.bulkImportService.importProducts(
        importDto,
        req.user.id,
      )

      return createdResponse({
        resource: PATH_SOURCE.PRODUCT,
        message: `Importación desde Excel completada. ${result.successCount}/${result.totalProcessed} productos procesados exitosamente`,
        data: result,
      })
    } catch (error) {
      console.log('ERRRRR', error)
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException(
        `Error procesando el archivo: ${error.message}`,
      )
    }
  }

  /**
   * Valida un archivo Excel sin procesarlo
   */
  @Post('validate-excel')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleEnum.Admin, RoleEnum.Manager)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER] })
  @UseInterceptors(FastifyFileInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo Excel para validar estructura y contenido',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo Excel para validar',
        },
      },
      required: ['file'],
    },
  })
  async validateExcel(@Req() req: FastifyRequest): Promise<
    ApiResponse<{
      isValid: boolean
      errors: string[]
      warnings: string[]
      totalRows: number
      previewData?: any[]
      stats?: {
        newCategories: string[]
        newCompanies: string[]
        existingProducts: number
        duplicatedBarcodes: string[]
        invalidPrices: number
        missingRequiredFields: number
      }
    }>
  > {
    try {
      if (!req.isMultipart()) {
        throw new BadRequestException('La request debe ser multipart/form-data')
      }

      const parts = req.parts()
      let fileBuffer: Buffer | null = null

      for await (const part of parts) {
        if (part.type === 'file') {
          const chunks: Buffer[] = []
          for await (const chunk of part.file) {
            chunks.push(chunk as Buffer)
          }
          fileBuffer = Buffer.concat(chunks)
          break
        }
      }

      if (!fileBuffer) {
        throw new BadRequestException('Archivo Excel es requerido')
      }

      // Validar estructura
      const validation =
        await this.bulkImportService.validateExcelStructure(fileBuffer)

      // Generar preview de los primeros 5 registros con la estructura CORRECTA
      let previewData: any[] = []
      const stats = {
        newCategories: [],
        newCompanies: [],
        existingProducts: 0,
        duplicatedBarcodes: [],
        invalidPrices: 0,
        missingRequiredFields: 0,
      }

      if (validation.isValid) {
        try {
          // Obtener preview con los nombres de columnas originales en español
          previewData =
            await this.bulkImportService.parseExcelToPreviewData(fileBuffer)
        } catch (error) {
          validation.errors.push(`Error al generar preview: ${error.message}`)
          validation.isValid = false
        }
      }

      return readResponse({
        resource: 'bulk-product-import',
        message: validation.isValid
          ? `Archivo válido con ${validation.totalRows} filas de datos`
          : `Archivo inválido: ${validation.errors.length} errores encontrados`,
        data: {
          ...validation,
          previewData,
          stats,
        },
      })
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException(
        `Error procesando el archivo: ${error.message}`,
      )
    }
  }

  /**
   * Obtiene un template de Excel con las columnas esperadas
   */
  @Get('excel-template')
  @HttpCode(HttpStatus.OK)
  @Roles(RoleEnum.Admin, RoleEnum.Manager, RoleEnum.Cashier)
  @SerializeOptions({ groups: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CASHIER] })
  async getExcelTemplate(): Promise<
    ApiResponse<{
      excelTemplate: Buffer
      headers: string[]
      exampleRow: string[]
    }>
  > {
    // Generar archivo Excel de ejemplo usando el servicio
    const excelTemplate = await this.bulkImportService.generateExcelTemplate()

    return readResponse({
      resource: 'excel-template',
      message: 'Template Excel generado correctamente',
      data: {
        excelTemplate,
      },
    })
  }
}
