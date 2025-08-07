import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator'
import {
  Accounting,
  TypeOfIssue,
  EnvironmentType,
} from '@/modules/establishment/establishment.enum'
import { FileDto } from '@/modules/files/dto/file.dto'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEcuadorianRUC } from '@/common/validators/ecuadorian.validator'

export class CreateEstablishmentDto {
  @ApiProperty({
    type: 'string',
    example: '1790012345001',
    description: 'RUC del proveedor',
    maxLength: 13,
  })
  @IsNotEmpty({ message: 'El RUC es obligatorio' })
  @IsString({ message: 'El RUC debe ser texto' })
  @Length(13, 13, { message: 'El RUC debe tener exactamente 13 caracteres' })
  @IsEcuadorianRUC({ message: 'El RUC no es válido' })
  ruc: string

  @ApiProperty({
    type: String,
    example: 'Empresa XYZ S.A.',
    description: 'Razón social / nombres o apellidos',
    maxLength: 300,
  })
  @IsNotEmpty({ message: 'La razón social es obligatorio' })
  @IsString({ message: 'La razón social debe ser texto' })
  @MaxLength(300, {
    message: 'La razón social debe tener máximo 300 caracteres',
  })
  companyName: string

  @ApiProperty({
    type: String,
    example: 'Comercial XYZ',
    description: 'Nombre comercial',
    maxLength: 300,
  })
  @IsNotEmpty({ message: 'El nombre comercial es obligatorio' })
  @IsString({ message: 'El nombre comercial debe ser texto' })
  @MaxLength(300, {
    message: 'El nombre comercial debe tener máximo 300 caracteres',
  })
  tradeName: string

  @ApiPropertyOptional({
    type: String,
    example: 'Av. Principal 123 y Calle Secundaria',
    description: 'Dirección del establecimiento matriz',
    maxLength: 300,
  })
  @IsOptional()
  @IsString({ message: 'La dirección matriz debe ser texto' })
  @MaxLength(300, {
    message: 'La dirección matriz debe tener máximo 300 caracteres',
  })
  parentEstablishmentAddress?: string | null

  @ApiProperty({
    type: String,
    example: 'Av. Principal 456 y Calle Secundaria',
    description: 'Dirección del establecimiento emisor',
    maxLength: 300,
  })
  @IsNotEmpty({ message: 'La dirección emisor es obligatorio' })
  @IsString({ message: 'La dirección emisor debe ser texto' })
  @MaxLength(300, {
    message: 'La dirección emisor debe tener máximo 300 caracteres',
  })
  addressIssuingEstablishment: string

  @ApiPropertyOptional({
    type: 'number',
    example: 1,
    description: 'Código del establecimiento emisor (3 dígitos)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'El código de establecimiento debe ser un número' })
  issuingEstablishmentCode?: number | null

  @ApiPropertyOptional({
    type: 'number',
    example: 1,
    description: 'Código punto de emisión (3 dígitos)',
  })
  @IsOptional()
  @IsNumber({}, { message: 'El código de punto de emisión debe ser un número' })
  issuingPointCode?: number | null

  @ApiProperty({
    type: 'number',
    example: 12345,
    description: 'Número de resolución (5 dígitos)',
  })
  @IsNotEmpty({ message: 'El número de resolución es obligatorio' })
  @IsNumber({}, { message: 'El número de resolución debe ser un número' })
  resolutionNumber: number

  @ApiProperty({
    enum: Accounting,
    example: Accounting.YES,
    description: 'Obligado a llevar contabilidad (SI/NO)',
  })
  @IsNotEmpty({ message: 'El campo contabilidad es obligatorio' })
  @IsEnum(Accounting, {
    message: `La contabilidad debe ser: ${Object.values(Accounting).join(' o ')}`,
  })
  accounting: Accounting

  @ApiPropertyOptional({
    type: () => FileDto,
    description: 'Foto/logo del establecimiento',
  })
  @IsOptional()
  photo?: FileDto | null

  @ApiProperty({
    enum: EnvironmentType,
    example: EnvironmentType.PRODUCTION,
    description: 'Tipo de ambiente',
  })
  @IsNotEmpty({ message: 'El tipo de ambiente es obligatorio' })
  @IsEnum(EnvironmentType, {
    message: `El tipo de ambiente debe ser: ${Object.values(EnvironmentType).join(' o ')}`,
  })
  environmentType: EnvironmentType

  @ApiProperty({
    enum: TypeOfIssue,
    example: TypeOfIssue.ISSUSE_NORMAL,
    description: 'Tipo de emisión',
  })
  @IsNotEmpty({ message: 'El tipo de emisión es obligatorio' })
  @IsEnum(TypeOfIssue, {
    message: `El tipo de emisión debe ser: ${Object.values(TypeOfIssue).join(' o ')}`,
  })
  typeIssue: TypeOfIssue
}
