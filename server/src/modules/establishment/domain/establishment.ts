import {
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
} from 'class-validator'
import {
  Accounting,
  TypeOfIssue,
  EnvironmentType,
} from '@/modules/establishment/establishment.enum'
import { FileType } from '@/modules/files/domain/file'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEcuadorianRUC } from '@/common/validators/ecuadorian.validator'

export class Establishment {
  @ApiProperty({
    type: 'string',
    example: '63ee8a88-ed2e-4499-9190-e65ee225ee66',
  })
  @IsUUID('4')
  id: string

  @ApiProperty({
    type: String,
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

  @ApiProperty({
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
    enum: Accounting,
    example: Accounting.YES,
    description: 'Obligado a llevar contabilidad (SI/NO)',
  })
  @IsNotEmpty({ message: 'El campo contabilidad es obligatorio' })
  @IsEnum(Accounting, {
    message: `La contabilidad debe ser: ${Object.values(Accounting).join(' o ')}`,
  })
  accounting: Accounting

  @ApiProperty({
    type: () => FileType,
  })
  photo?: FileType | null

  @ApiPropertyOptional({
    enum: EnvironmentType,
    example: EnvironmentType.PRODUCTION,
    description: 'Tipo de ambiente',
  })
  @IsEmpty()
  @IsEnum(EnvironmentType, {
    message: `El tipo de ambiente debe ser: ${Object.values(EnvironmentType).join(' o ')}`,
  })
  environmentType?: EnvironmentType | null

  @ApiProperty({
    type: Date,
    example: '2024-06-16T12:34:56.789Z',
    description: 'Fecha de creación',
  })
  createdAt: Date

  @ApiProperty({
    type: Date,
    example: '2024-06-16T15:00:00.000Z',
    description: 'Fecha de última actualización',
  })
  updatedAt: Date
}
