import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  ValidateNested,
} from 'class-validator'
import { Establishment } from '@/modules/establishment/domain/establishment'
import {
  Accounting,
  EnvironmentType,
  TypeOfIssue,
} from '@/modules/establishment/establishment.enum'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform, Type, plainToInstance } from 'class-transformer'

export class FilterEstablishmentDto {
  @ApiPropertyOptional({
    enum: Accounting,
    description: `Obligado a llevar contabilidad (${Object.values(Accounting).join(', ')})`,
  })
  @IsOptional()
  @IsEnum(Accounting, {
    message: `La contabilidad debe ser uno de: ${Object.values(Accounting).join(', ')}`,
  })
  accounting?: Accounting

  @ApiPropertyOptional({
    enum: EnvironmentType,
    description: `Tipo de ambiente (${Object.values(EnvironmentType).join(', ')})`,
  })
  @IsOptional()
  @IsEnum(EnvironmentType, {
    message: `El tipo de ambiente debe ser uno de: ${Object.values(EnvironmentType).join(', ')}`,
  })
  environmentType?: EnvironmentType

  @ApiPropertyOptional({
    enum: TypeOfIssue,
    description: `Tipo de emisión (${Object.values(TypeOfIssue).join(', ')})`,
  })
  @IsOptional()
  @IsEnum(TypeOfIssue, {
    message: `El tipo de emisión debe ser uno de: ${Object.values(TypeOfIssue).join(', ')}`,
  })
  typeIssue?: TypeOfIssue

  @ApiPropertyOptional({
    type: 'number',
    description: 'Filtrar por RUC',
    example: 1791234567001,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El RUC debe ser un número' })
  ruc?: number

  @ApiPropertyOptional({
    type: String,
    description: 'Filtrar por razón social',
    example: 'Empresa XYZ',
  })
  @IsOptional()
  @IsString({ message: 'La razón social debe ser texto' })
  companyName?: string

  @ApiPropertyOptional({
    type: String,
    description: 'Filtrar por nombre comercial',
    example: 'Comercial XYZ',
  })
  @IsOptional()
  @IsString({ message: 'El nombre comercial debe ser texto' })
  tradeName?: string

  @ApiPropertyOptional({
    type: String,
    description: 'Filtrar por código de establecimiento emisor',
    example: '001',
  })
  @IsOptional()
  @IsNumber({}, { message: 'El código de establecimiento debe ser un número' })
  issuingEstablishmentCode?: number

  @ApiPropertyOptional({
    type: String,
    description: 'Filtrar por número de resolución',
    example: '12345',
  })
  @IsOptional()
  @IsNumber({}, { message: 'El número de resolución debe ser un número' })
  resolutionNumber?: number
}

export class SortEstablishmentDto {
  @ApiProperty({
    example: 'companyName',
    description: 'Campo por el cual ordenar',
  })
  @Type(() => String)
  @IsString()
  orderBy: keyof Establishment

  @ApiProperty({
    example: 'ASC',
    description: 'Dirección del orden (ASC o DESC)',
    enum: ['ASC', 'DESC'],
  })
  @IsString()
  @IsEnum(['ASC', 'DESC'], {
    message: 'El orden debe ser ASC o DESC',
  })
  order: 'ASC' | 'DESC'
}

export class QueryEstablishmentDto {
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
    example: '{"accounting": "YES", "environmentType": "PRODUCTION"}',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value
      ? plainToInstance(FilterEstablishmentDto, JSON.parse(value))
      : undefined,
  )
  @ValidateNested()
  @Type(() => FilterEstablishmentDto)
  filters?: FilterEstablishmentDto | null

  @ApiPropertyOptional({
    type: String,
    description: 'Ordenamiento en formato JSON stringify',
    example: '[{"orderBy": "companyName", "order": "ASC"}]',
  })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortEstablishmentDto, JSON.parse(value))
      : undefined
  })
  @ValidateNested({ each: true })
  @Type(() => SortEstablishmentDto)
  sort?: SortEstablishmentDto[] | null

  @ApiPropertyOptional({
    description:
      'Búsqueda textual (busca en razón social, nombre comercial, RUC)',
  })
  @IsOptional()
  @IsString()
  search?: string | null
}
