import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  ValidateNested,
} from 'class-validator'
import { Supplier } from '@/modules/suppliers/domain/supplier'
import { SupplierStatus } from '@/modules/suppliers/status.enum'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type, plainToInstance } from 'class-transformer'

export class FilterSupplierDto {
  @ApiPropertyOptional({
    enum: SupplierStatus,
    description: 'Estado del proveedor (active, inactive)',
  })
  @IsOptional()
  @IsEnum(SupplierStatus, {
    message: `El estado debe ser uno de: ${Object.values(SupplierStatus).join(', ')}`,
  })
  status?: SupplierStatus
}

export class SortSupplierDto {
  @ApiProperty({
    example: 'legalName',
    description: 'Campo por el cual ordenar',
  })
  @Type(() => String)
  @IsString()
  orderBy: keyof Supplier

  @ApiProperty({
    example: 'ASC',
    description: 'Dirección del orden (ASC o DESC)',
  })
  @IsString()
  order: string
}

export class QuerySupplierDto {
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
    example: '{"status": "active", "ruc": "1790012345001"}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterSupplierDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterSupplierDto)
  filters?: FilterSupplierDto | null

  @ApiPropertyOptional({
    type: String,
    description: 'Ordenamiento en formato JSON stringify',
    example: '[{"orderBy": "legalName", "order": "ASC"}]',
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortSupplierDto, JSON.parse(value))
      : undefined
  })
  @ValidateNested({ each: true })
  @Type(() => SortSupplierDto)
  sort?: SortSupplierDto[] | null

  @ApiPropertyOptional({
    description: 'Búsqueda textual en razón social o nombre comercial',
  })
  @IsOptional()
  @IsString()
  search?: string | null
}
