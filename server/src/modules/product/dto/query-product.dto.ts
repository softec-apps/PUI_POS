import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  ValidateNested,
} from 'class-validator'
import { Product } from '@/modules/product/domain/product'
import { ProductStatus } from '@/modules/product/status.enum'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type, plainToInstance } from 'class-transformer'

export class FilterProductDto {
  @ApiPropertyOptional({
    enum: ProductStatus,
    description: `Estado del producto (${Object.values(ProductStatus).join(', ')})`,
  })
  @IsOptional()
  @IsEnum(ProductStatus, {
    message: `El estado debe ser uno de: ${Object.values(ProductStatus).join(', ')}`,
  })
  status?: ProductStatus

  @ApiPropertyOptional({
    description: 'Filtrar por categoría (UUID)',
    example: 'd28c1dfe-e546-4b6f-812d-0c1a1ee42a3e',
  })
  @IsOptional()
  @IsString()
  categoryId?: string

  @ApiPropertyOptional({
    description: 'Filtrar por marca (UUID)',
    example: 'a61c238a-2313-4c9f-8f52-8d0c5a2a68b2',
  })
  @IsOptional()
  @IsString()
  brandId?: string

  @ApiPropertyOptional({
    description: 'Filtrar por proveedor (UUID)',
    example: 'f22c8450-d1c2-42f6-91cc-4a6f2bc46df3',
  })
  @IsOptional()
  @IsString()
  supplierId?: string
}

export class SortProductDto {
  @ApiProperty({
    example: 'name',
    description: 'Campo por el cual ordenar',
  })
  @Type(() => String)
  @IsString()
  orderBy: keyof Product

  @ApiProperty({
    example: 'ASC',
    description: 'Dirección del orden (ASC o DESC)',
  })
  @IsString()
  order: string
}

export class QueryProductDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Número de página',
    default: 1,
  })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number

  @ApiPropertyOptional({
    example: 10,
    description: 'Límite de resultados por página',
    default: 10,
  })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number

  @ApiPropertyOptional({
    type: String,
    description: 'Filtros en formato JSON stringify',
    example: '{"status": "active"}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterProductDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterProductDto)
  filters?: FilterProductDto | null

  @ApiPropertyOptional({
    type: String,
    description: 'Ordenamiento en formato JSON stringify',
    example: '[{"orderBy": "name", "order": "ASC"}]',
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortProductDto, JSON.parse(value))
      : undefined
  })
  @ValidateNested({ each: true })
  @Type(() => SortProductDto)
  sort?: SortProductDto[] | null

  @ApiPropertyOptional({
    description: 'Búsqueda textual',
  })
  @IsOptional()
  @IsString()
  search?: string | null
}
