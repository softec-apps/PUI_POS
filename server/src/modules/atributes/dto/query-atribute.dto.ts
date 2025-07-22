import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsString,
  ValidateNested,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Atribute } from '@/modules/atributes/domain/atribute'
import { Transform, Type, plainToInstance } from 'class-transformer'
import { AtributeTypeAllow } from '@/modules/atributes/atribute-types-allow.enum'

export class FilterAtributeDto {
  @ApiPropertyOptional({
    enum: AtributeTypeAllow,
    description: 'Filtrar por tipo de atributo',
  })
  @IsOptional()
  @IsEnum(AtributeTypeAllow, {
    message: `El tipo debe ser uno de: ${Object.values(AtributeTypeAllow).join(', ')}`,
  })
  type?: AtributeTypeAllow

  @ApiPropertyOptional({
    description: 'Filtrar por si el atributo es obligatorio',
  })
  @IsOptional()
  @IsBoolean({ message: 'Debe ser true o false' })
  required?: boolean
}

export class SortAtributeDto {
  @ApiProperty({
    description: 'Campo por el que ordenar',
    example: 'name',
  })
  @IsString()
  orderBy: keyof Atribute

  @ApiProperty({
    description: 'Dirección de ordenamiento (asc o desc)',
    example: 'asc',
  })
  @IsString()
  order: 'asc' | 'desc'
}

export class QueryAtributeDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number = 1

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number = 10

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterAtributeDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterAtributeDto)
  filters?: FilterAtributeDto | null

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(SortAtributeDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested({ each: true })
  @Type(() => SortAtributeDto)
  sort?: SortAtributeDto[] | null

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  search?: string | null
}
