import {
  IsIn,
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
  ValidateNested,
} from 'class-validator'
import { Template } from '@/modules/template/domain/template'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type, plainToInstance } from 'class-transformer'

export class FilterTemplateDto {
  @ApiPropertyOptional({
    description: 'Filtrar por si el atributo es obligatorio',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Debe ser true o false' })
  required?: boolean
}

export class SortTemplateDto {
  @ApiProperty({
    description: 'Campo por el que ordenar',
    example: 'name',
  })
  @IsString()
  orderBy: keyof Template

  @ApiProperty({
    description: 'Dirección de ordenamiento (asc o desc)',
    example: 'asc',
  })
  @IsString()
  @IsIn(['asc', 'desc'], { message: 'order debe ser "asc" o "desc"' })
  order: 'asc' | 'desc'
}

export class QueryTemplateDto {
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
    type: () => FilterTemplateDto,
    description: 'Filtros adicionales (formato JSON string)',
    example: '{"required":true}',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterTemplateDto)
  @Transform(({ value }) =>
    typeof value === 'string' && value
      ? plainToInstance(FilterTemplateDto, JSON.parse(value))
      : value,
  )
  filters?: FilterTemplateDto | null

  @ApiPropertyOptional({
    type: [SortTemplateDto],
    description: 'Opciones de ordenamiento (formato JSON string array)',
    example: '[{"orderBy":"name","order":"asc"}]',
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SortTemplateDto)
  @Transform(({ value }) =>
    typeof value === 'string' && value
      ? JSON.parse(value).map((sort: any) =>
          plainToInstance(SortTemplateDto, sort),
        )
      : value,
  )
  sort?: SortTemplateDto[] | null

  @ApiPropertyOptional({
    description: 'Búsqueda general',
    example: 'plantilla',
  })
  @IsOptional()
  @IsString()
  search?: string | null
}
