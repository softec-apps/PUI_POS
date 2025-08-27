import { User } from '@/modules/users/domain/user'
import { RoleDto } from '@/modules/roles/dto/role.dto'
import { StatusDto } from '@/statuses/dto/status.dto'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type, plainToInstance } from 'class-transformer'
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { DateRangeDto } from '@/utils/dto/DateRangeDto'

export class FilterUserDto {
  @ApiPropertyOptional({
    type: RoleDto,
    description:
      'Estado de la categoría (1 = admin, 2 = cashier, 3 = manager, 4 = inventory, 5 = customer)',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RoleDto)
  roleId?: RoleDto[] | null

  @ApiPropertyOptional({
    type: StatusDto,
    description: 'Estado de la categoría (1 = Active, 2 = Inactive )',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => StatusDto)
  statusId?: StatusDto[] | null

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

export class SortUserDto {
  @ApiProperty({
    description: 'Campo por el que ordenar',
    example: 'email',
  })
  @IsString()
  orderBy: keyof User

  @ApiProperty({
    description: 'Dirección de ordenamiento (asc o desc)',
    example: 'asc',
  })
  @IsString()
  @IsIn(['asc', 'desc'], { message: 'order debe ser "asc" o "desc"' })
  order: 'asc' | 'desc'
}

export class QueryUserDto {
  @ApiPropertyOptional({
    description: 'Página solicitada',
    example: 1,
  })
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página',
    example: 10,
  })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number

  @ApiPropertyOptional({
    type: () => FilterUserDto,
    description: 'Filtros adicionales (formato JSON string)',
    example: '{"field":"value"}',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterUserDto)
  @Transform(({ value }) =>
    typeof value === 'string' && value
      ? plainToInstance(FilterUserDto, JSON.parse(value))
      : value,
  )
  filters?: FilterUserDto | null

  @ApiPropertyOptional({
    type: [SortUserDto],
    description: 'Opciones de ordenamiento (formato JSON string array)',
    example: '[{"filed":"value","order":"asc"}]',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SortUserDto)
  @Transform(({ value }) =>
    typeof value === 'string' && value
      ? JSON.parse(value).map((sort: any) => plainToInstance(SortUserDto, sort))
      : value,
  )
  sort?: SortUserDto[] | null

  @ApiPropertyOptional({
    description: 'Búsqueda general',
    example: 'categoria',
  })
  @IsOptional()
  @IsString()
  search?: string | null
}
