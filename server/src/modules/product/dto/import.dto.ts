import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { ProductStatus } from '@/modules/product/status.enum'

export class BulkProductImportItemDto {
  @ApiProperty({
    description: 'SKU o Identificación del producto',
    example: 'ITEM001',
    required: false,
  })
  @IsOptional()
  @IsString()
  sku?: string

  @ApiProperty({
    description: 'Código de barras UPC/EAN/ISBN',
    example: '7860001234567',
    required: false,
  })
  @IsOptional()
  @IsString()
  barcode?: string

  @ApiProperty({
    description: 'Nombre del artículo/producto',
    example: 'Camiseta Básica Algodón',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  itemName: string

  @ApiProperty({
    description:
      'Nombre de la categoría (se creará automáticamente si no existe)',
    example: 'Ropa',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string

  @ApiProperty({
    description:
      'Nombre de la compañía/proveedor (se creará automáticamente si no existe)',
    example: 'Textiles del Ecuador',
    required: false,
  })
  @IsOptional()
  @IsString()
  legalName?: string

  @ApiProperty({
    description: 'Precio al por mayor/costo',
    example: 15.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number

  @ApiProperty({
    description: 'Precio de venta al público',
    example: 29.99,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  unitPrice: number

  @ApiProperty({
    description: 'Cantidad en stock/inventario',
    example: 100,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  locationStock?: number

  @ApiProperty({
    description: 'Porcentaje de impuesto aplicable',
    example: 15,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  taxPercent?: number

  @ApiProperty({
    description: 'URL o nombre del archivo de imagen/avatar',
    example: 'camiseta.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string

  @ApiProperty({
    description: 'Estado del producto',
    enum: ProductStatus,
    example: ProductStatus.ACTIVE,
    required: false,
    default: ProductStatus.ACTIVE,
  })
  @IsOptional()
  status?: ProductStatus

  @ApiProperty({
    description: 'ID de marca (si se conoce)',
    example: 'uuid-de-marca',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  brandId?: string
}

export class BulkProductImportDto {
  @ApiProperty({
    description: 'Lista de productos a importar',
    type: [BulkProductImportItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkProductImportItemDto)
  products: BulkProductImportItemDto[]

  @ApiProperty({
    description: 'Continuar importación aunque algunos productos fallen',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  continueOnError?: boolean

  @ApiProperty({
    description:
      'Actualizar productos existentes encontrados por barcode o SKU',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  updateExisting?: boolean

  @ApiProperty({
    description:
      'ID de categoría por defecto para productos sin categoría específica',
    example: 'uuid-categoria-default',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string

  @ApiProperty({
    description: 'ID de marca por defecto para todos los productos',
    example: 'uuid-marca-default',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  brandId?: string

  @ApiProperty({
    description:
      'ID de proveedor por defecto para productos sin proveedor específico',
    example: 'uuid-proveedor-default',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  supplierId?: string
}

export class BulkImportResultDto {
  @ApiProperty({
    description: 'Número total de productos procesados exitosamente',
    example: 45,
  })
  successCount: number

  @ApiProperty({
    description: 'Número total de productos que fallaron',
    example: 3,
  })
  errorCount: number

  @ApiProperty({
    description: 'Mensajes de éxito para cada producto procesado',
    example: [
      'Producto creado: Camiseta Básica (Código: PROD-001)',
      'Producto actualizado: Pantalón Jean (Código: PROD-002)',
    ],
  })
  successMessages: string[]

  @ApiProperty({
    description: 'Mensajes de error para productos que fallaron',
    example: [
      'Error en fila 5: El precio unitario debe ser mayor a 0',
      'Error en fila 12: El nombre del producto es obligatorio',
    ],
  })
  errorMessages: string[]

  @ApiProperty({
    description: 'Total de registros procesados (éxitos + errores)',
    example: 48,
  })
  totalProcessed: number

  @ApiProperty({
    description: 'Número de productos nuevos creados',
    example: 40,
  })
  createdCount: number

  @ApiProperty({
    description: 'Número de productos existentes actualizados',
    example: 5,
  })
  updatedCount: number

  @ApiProperty({
    description: 'Número de entradas al kardex',
    example: 5,
  })
  kardexEntriesCreated: number
}

export class BulkImportValidationDto {
  @ApiProperty({
    description: 'Indica si el archivo es válido para importación',
    example: true,
  })
  isValid: boolean

  @ApiProperty({
    description: 'Lista de errores críticos encontrados',
    example: ['Fila 5: Nombre del producto es obligatorio'],
  })
  errors: string[]

  @ApiProperty({
    description: 'Lista de advertencias (no bloquean la importación)',
    example: ['Fila 10: Se recomienda especificar una categoría'],
  })
  warnings: string[]

  @ApiProperty({
    description: 'Número total de filas de datos (excluyendo headers)',
    example: 150,
  })
  totalRows: number

  @ApiProperty({
    description: 'Vista previa de los primeros registros válidos',
    example: [
      {
        itemName: 'Camiseta Básica',
        unitPrice: 29.99,
        category: 'Ropa',
        barcode: '7860001234567',
        stock: 100,
      },
    ],
    required: false,
  })
  previewData?: Array<{
    itemName: string
    unitPrice: number
    category?: string
    barcode?: string
    stock?: number
  }>
}

export class ExcelTemplateDto {
  @ApiProperty({
    description: 'Buffer del archivo Excel template',
    type: 'string',
    format: 'binary',
  })
  excelTemplate: Buffer

  @ApiProperty({
    description: 'Lista de headers/columnas esperadas',
    example: [
      'Identificación',
      'UPC/EAN/ISBN',
      'Nombre Artículo',
      'Categoría',
      'Nombre de la Compañia',
      'Precio al Por Mayor',
      'Precio de Venta',
      'Cantidad en Stock',
      'Porcentaje de Impuesto(s)',
      'Avatar',
    ],
  })
  headers: string[]

  @ApiProperty({
    description: 'Fila de ejemplo con datos de muestra',
    example: [
      'ITEM001',
      '7860001234567',
      'Camiseta Básica Algodón',
      'Ropa',
      'Textiles del Ecuador',
      '15.5',
      '29.99',
      '100',
      '15',
      'camiseta.jpg',
    ],
  })
  exampleRow: string[]
}
