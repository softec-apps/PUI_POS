import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { Transform, Type, plainToInstance } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { KardexMovementType } from '@/modules/kardex/movement-type.enum'
import { Kardex } from '@/modules/kardex/domain/kardex'

export class FilterKardexDto {
  @ApiPropertyOptional({
    enum: KardexMovementType,
    description: `Tipo de movimiento (${Object.values(KardexMovementType).join(', ')})`,
  })
  @IsOptional()
  @IsEnum(KardexMovementType, {
    message: `El tipo debe ser uno de: ${Object.values(KardexMovementType).join(', ')}`,
  })
  movementType?: KardexMovementType

  @ApiPropertyOptional({
    example: 'b5e6c5fc3211',
    description: 'ID del producto',
  })
  @IsOptional()
  @IsString()
  productId?: string

  @ApiPropertyOptional({
    example: 'usuario-id-123',
    description: 'ID del usuario que registró el movimiento',
  })
  @IsOptional()
  @IsString()
  userId?: string
}

export class SortKardexDto {
  @ApiPropertyOptional({
    example: 'createdAt',
    description: 'Campo por el cual ordenar',
  })
  @Type(() => String)
  @IsString()
  orderBy: keyof Kardex

  @ApiPropertyOptional({
    example: 'DESC',
    description: 'Dirección del orden (ASC o DESC)',
  })
  @IsString()
  order: 'ASC' | 'DESC'
}

export class QueryKardexDto {
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
    description: 'Resultados por página',
    default: 10,
  })
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number

  @ApiPropertyOptional({
    type: String,
    description: 'Filtros como JSON stringify',
    example: '{"movementType":"sale","productId":"abc-123"}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterKardexDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterKardexDto)
  filters?: FilterKardexDto | null

  @ApiPropertyOptional({
    type: String,
    description: 'Ordenamiento en formato JSON stringify',
    example: '[{"orderBy": "legalName", "order": "ASC"}]',
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortKardexDto, JSON.parse(value)) : undefined
  })
  @ValidateNested({ each: true })
  @Type(() => SortKardexDto)
  sort?: SortKardexDto[] | null

  @ApiPropertyOptional({
    description: 'Texto libre de búsqueda (opcional, por razón o comentario)',
  })
  @IsOptional()
  @IsString()
  search?: string | null
}
