import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  ValidateNested,
} from 'class-validator'
import { Customer } from '@/modules/customer/domain/customer'
import {
  CustomerType,
  IdentificationType,
} from '@/modules/customer/customer.enum'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type, plainToInstance } from 'class-transformer'
import { DateRangeDto } from '@/utils/dto/DateRangeDto'

export class FilterCustomerDto {
  @ApiPropertyOptional({
    enum: CustomerType,
    description: 'Tipo de cliente (REGULAR, FINAL_CONSUMER)',
  })
  @IsOptional()
  @IsEnum(CustomerType, {
    message: `El tipo de cliente debe ser uno de: ${Object.values(CustomerType).join(', ')}`,
  })
  customerType?: CustomerType

  @ApiPropertyOptional({
    enum: IdentificationType,
    description: 'Tipo de identificación (RUC, CÉDULA, PASAPORTE, etc.)',
  })
  @IsOptional()
  @IsEnum(IdentificationType, {
    message: `El tipo de identificación debe ser uno de: ${Object.values(IdentificationType).join(', ')}`,
  })
  identificationType?: IdentificationType

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

export class SortCustomerDto {
  @ApiProperty({
    example: 'firstName',
    description:
      'Campo por el cual ordenar (firstName, lastName, businessName, etc.)',
  })
  @Type(() => String)
  @IsString()
  orderBy: keyof Customer

  @ApiProperty({
    example: 'ASC',
    description: 'Dirección del orden (ASC o DESC)',
  })
  @IsString()
  order: string
}

export class QueryCustomerDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Número de página',
    default: 1,
  })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number = 1

  @ApiPropertyOptional({
    example: 10,
    description: 'Límite de resultados por página',
    default: 10,
  })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number = 10

  @ApiPropertyOptional({
    type: String,
    description: 'Filtros en formato JSON stringify',
    example: '{"customerType": "REGULAR", "identificationType": "RUC"}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterCustomerDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterCustomerDto)
  filters?: FilterCustomerDto | null

  @ApiPropertyOptional({
    type: String,
    description: 'Ordenamiento en formato JSON stringify',
    example: '[{"orderBy": "firstName", "order": "ASC"}]',
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortCustomerDto, JSON.parse(value))
      : undefined
  })
  @ValidateNested({ each: true })
  @Type(() => SortCustomerDto)
  sort?: SortCustomerDto[] | null

  @ApiPropertyOptional({
    description: 'Búsqueda textual (busca en nombres, apellidos, etc.)',
  })
  @IsOptional()
  @IsString()
  search?: string | null
}
