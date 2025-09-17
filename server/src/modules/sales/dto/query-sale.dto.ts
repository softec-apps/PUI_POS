import {
  IsIn,
  IsNumber,
  IsString,
  IsOptional,
  ValidateNested,
  IsUUID,
  IsDateString,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type, plainToInstance } from 'class-transformer'
import { SaleEntity } from '@/modules/sales/infrastructure/persistence/relational/entities/sale.entity'
import { DateRangeDto } from '@/utils/dto/DateRangeDto'
import { StatusSRI } from '@/modules/sales/sale.enum'
import { User } from '@/modules/users/domain/user'

export class FilterSaleDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de usuario',
    example: 'd7a2d85d-453c-4ed0-a2cf-c2099aafdfe4',
  })
  @IsOptional()
  @IsUUID(4, { message: 'El ID del usuario debe ser un UUID válido' })
  user?: User | null

  @ApiPropertyOptional({
    description: 'Filtrar por ID de cliente',
    example: 'd7a2d85d-453c-4ed0-a2cf-c2099aafdfe4',
  })
  @IsOptional()
  @IsUUID(4, { message: 'El ID de cliente debe ser un UUID válido' })
  userId?: string

  @ApiPropertyOptional({
    description: 'Filtrar por ID de cliente',
    example: 'd7a2d85d-453c-4ed0-a2cf-c2099aafdfe4',
  })
  @IsOptional()
  @IsString({
    message: `Estado del producto (${Object.values(StatusSRI).join(', ')})`,
  })
  estado_sri?: string

  @ApiPropertyOptional({
    type: DateRangeDto,
    description: 'Filtro por rango de fecha de creación',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  createdAt?: DateRangeDto | null
}

export class SortSaleDto {
  @ApiProperty({
    description: 'Campo por el que ordenar',
    example: 'createdAt',
  })
  @IsString()
  orderBy: keyof SaleEntity

  @ApiProperty({
    description: 'Dirección de ordenamiento (asc o desc)',
    example: 'asc',
  })
  @IsString()
  @IsIn(['asc', 'desc'], { message: 'order debe ser "asc" o "desc"' })
  order: 'asc' | 'desc'
}

export class QuerySaleDto {
  @ApiPropertyOptional({
    description: 'Página solicitada',
    example: 1,
  })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page: number = 1

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página',
    example: 10,
  })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit: number = 10

  @ApiPropertyOptional({
    type: () => FilterSaleDto,
    description: 'Filtros adicionales (formato JSON string)',
    example: '{"customerId":"uuid","paymentMethod":"cash"}',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterSaleDto)
  @Transform(({ value }) =>
    typeof value === 'string' && value
      ? plainToInstance(FilterSaleDto, JSON.parse(value))
      : value,
  )
  filters?: FilterSaleDto | null

  @ApiPropertyOptional({
    type: [SortSaleDto],
    description: 'Opciones de ordenamiento (formato JSON string array)',
    example: '[{"orderBy":"createdAt","order":"desc"}]',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SortSaleDto)
  @Transform(({ value }) =>
    typeof value === 'string' && value
      ? JSON.parse(value).map((sort: any) => plainToInstance(SortSaleDto, sort))
      : value,
  )
  sort?: SortSaleDto[] | null

  @ApiPropertyOptional({
    description: 'Búsqueda general',
    example: 'pago con tarjeta',
  })
  @IsOptional()
  @IsString()
  search?: string | null
}
