import { IsEcuadorianRUC } from '@/common/validators/ecuadorian.validator'
import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from '@nestjs/swagger'
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'
import { AmbienteEnum } from '../billing.enum'

export class ProfileData {
  @ApiPropertyOptional({
    description: 'Nombre del cliente',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  name?: string

  @ApiPropertyOptional({
    description: 'Correo electrónico',
    example: 'john@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string

  @ApiPropertyOptional({
    description: 'Contraseña del usuario',
    example: 'securePass123',
  })
  @IsOptional()
  @IsString()
  password?: string

  @ApiPropertyOptional({
    description: 'Razón social de la empresa',
    example: 'ABC Company',
  })
  @IsOptional()
  @IsString()
  razonSocial?: string

  @ApiProperty({
    description: 'Ambiente de la empresa (1 = Pruebas, 2 = Producción)',
    enum: AmbienteEnum,
    example: AmbienteEnum.PRUEBAS,
  })
  @IsOptional()
  @IsEnum(AmbienteEnum, {
    message: 'El ambiente debe ser 1 (Pruebas) o 2 (Producción)',
  })
  ambiente?: AmbienteEnum

  @ApiPropertyOptional({
    description: 'Tarifa de la empresa',
    example: 'ABC Company',
  })
  @IsOptional()
  @IsString()
  tarifa?: string

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

  @ApiPropertyOptional({
    description: 'Nombre comercial de la empresa',
    example: 'ABC Company',
  })
  @IsOptional()
  @IsString()
  nombreComercial?: string

  @ApiPropertyOptional({
    description: 'Dirección de la matriz',
    example: 'Calle Principal 123',
  })
  @IsOptional()
  @IsString()
  dirMatriz?: string

  @ApiPropertyOptional({
    description: 'Número de contribuyente especial',
    example: '123456789',
  })
  @IsOptional()
  @IsString()
  contribuyenteEspecial?: string

  @ApiProperty({
    description: 'Si está obligado a llevar contabilidad',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  obligadoContabilidad?: boolean

  @ApiProperty({
    description: 'Fecha expiración firma electrónica',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  signature_expires_at?: string
}

/**
 * DTO para crear un perfil
 * Campos obligatorios: name, email, password, ambiente, obligadoContabilidad
 */
export class CreateProfileDto extends PickType(ProfileData, [
  'name',
  'email',
  'password',
  'ambiente',
  'obligadoContabilidad',
] as const) {}

/**
 * DTO para actualizar perfil
 * Hereda de ProfileData y permite opcionales
 */
export class UpdateProfileDto extends PartialType(ProfileData) {}

export interface ProfileResponse {
  success: boolean
  message: string
  data: ProfileData
  errors: Record<string, any>
}
