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
import { DateRangeDto } from '@/utils/dto/DateRangeDto'

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

  @ApiPropertyOptional({
    type: DateRangeDto,
    description: 'Filtro por rango de fecha de creación',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  createdAt?: DateRangeDto | null

  @ApiPropertyOptional({
    type: DateRangeDto,
    description: 'Filtro por rango de fecha de actualización',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  updatedAt?: DateRangeDto | null

  @ApiPropertyOptional({
    type: DateRangeDto,
    description: 'Filtro por rango de fecha de eliminación',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  deletedAt?: DateRangeDto | null
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
