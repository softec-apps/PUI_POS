import {
  IsDateString,
  IsEnum,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { Category } from '@/modules/categories/domain/category'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type, plainToInstance } from 'class-transformer'
import { CategoryStatus } from '@/modules/categories/category-status.enum'
import { DateRangeDto } from '@/utils/dto/DateRangeDto'

export class FilterCategoryDto {
  @ApiPropertyOptional({
    enum: CategoryStatus,
    description: 'Estado de la categoría (active o inactive)',
  })
  @IsOptional()
  @IsEnum(CategoryStatus, {
    message: 'El estado debe ser "active" o "inactive"',
  })
  status?: CategoryStatus

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

export class SortCategoryDto {
  @ApiProperty({
    description: 'Campo por el que ordenar',
    example: 'name',
  })
  @IsString()
  orderBy: keyof Category

  @ApiProperty({
    description: 'Dirección de ordenamiento (asc o desc)',
    example: 'asc',
  })
  @IsString()
  @IsIn(['asc', 'desc'], { message: 'order debe ser "asc" o "desc"' })
  order: 'asc' | 'desc'
}

export class QueryCategoryDto {
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
    type: () => FilterCategoryDto,
    description: 'Filtros adicionales (formato JSON string)',
    example: '{"field":"value"}',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterCategoryDto)
  @Transform(({ value }) =>
    typeof value === 'string' && value
      ? plainToInstance(FilterCategoryDto, JSON.parse(value))
      : value,
  )
  filters?: FilterCategoryDto | null

  @ApiPropertyOptional({
    type: [SortCategoryDto],
    description: 'Opciones de ordenamiento (formato JSON string array)',
    example: '[{"filed":"value","order":"asc"}]',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SortCategoryDto)
  @Transform(({ value }) =>
    typeof value === 'string' && value
      ? JSON.parse(value).map((sort: any) =>
          plainToInstance(SortCategoryDto, sort),
        )
      : value,
  )
  sort?: SortCategoryDto[] | null

  @ApiPropertyOptional({
    description: 'Búsqueda general',
    example: 'categoria',
  })
  @IsOptional()
  @IsString()
  search?: string | null
}
