import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  ValidateNested,
} from 'class-validator'
import { Brand } from '@/modules/brand/domain/brand'
import { BrandStatus } from '@/modules/brand/status.enum'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type, plainToInstance } from 'class-transformer'

export class FilterBrandDto {
  @ApiPropertyOptional({
    enum: BrandStatus,
    description: 'Estado de la marca (active, inactive)',
  })
  @IsOptional()
  @IsEnum(BrandStatus, {
    message: `El estado debe ser uno de: ${Object.values(BrandStatus).join(', ')}`,
  })
  status?: BrandStatus
}

export class SortBrandDto {
  @ApiProperty({
    example: 'name',
    description: 'Campo por el cual ordenar',
  })
  @Type(() => String)
  @IsString()
  orderBy: keyof Brand

  @ApiProperty({
    example: 'ASC',
    description: 'Dirección del orden (ASC o DESC)',
  })
  @IsString()
  order: string
}

export class QueryBrandDto {
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
    value ? plainToInstance(FilterBrandDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterBrandDto)
  filters?: FilterBrandDto | null

  @ApiPropertyOptional({
    type: String,
    description: 'Ordenamiento en formato JSON stringify',
    example: '[{"orderBy": "name", "order": "ASC"}]',
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortBrandDto, JSON.parse(value)) : undefined
  })
  @ValidateNested({ each: true })
  @Type(() => SortBrandDto)
  sort?: SortBrandDto[] | null

  @ApiPropertyOptional({
    description: 'Búsqueda textual',
  })
  @IsOptional()
  @IsString()
  search?: string | null
}
