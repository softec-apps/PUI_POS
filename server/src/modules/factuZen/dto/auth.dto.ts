import {
  IsEmail,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
} from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class LoginDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
  })
  @IsString()
  password: string
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token JWT de autenticación',
    example: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
  })
  @IsString()
  token: string

  @ApiPropertyOptional({
    description: 'ID del usuario autenticado',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  user_id?: number

  @ApiPropertyOptional({
    description: 'Tiempo de expiración en segundos (campo legacy)',
    example: 28800,
  })
  @IsOptional()
  @IsNumber()
  expires_in?: number

  @ApiPropertyOptional({
    description: 'Fecha y hora de expiración del token',
    example: '2025-08-28 07:48:38',
  })
  @IsOptional()
  @IsString()
  token_expires_at?: string

  @ApiPropertyOptional({
    description: 'Fecha y hora de expiración de la firma (si aplica)',
    example: null,
  })
  @IsOptional()
  @IsString()
  signature_expires_at?: string | null
}

export class CreateBillingDto {
  @ApiProperty({
    description: 'Email para autenticación con la API de facturación',
    example: 'facturacion@empresa.com',
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'Contraseña para autenticación con la API de facturación',
    example: 'password123',
  })
  @IsString()
  password: string
}

export class UpdateBillingDto {
  @ApiPropertyOptional({
    description: 'Email para autenticación con la API de facturación',
    example: 'nuevo_email@empresa.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({
    description: 'Contraseña para autenticación con la API de facturación',
    example: 'nueva_password123',
  })
  @IsOptional()
  @IsString()
  password?: string
}

// DTO para respuesta completa de la API de Laravel
export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  @IsBoolean()
  success: boolean

  @ApiProperty({
    description: 'Mensaje descriptivo de la respuesta',
    example: 'Inicio de sesión exitoso',
  })
  @IsString()
  message: string

  @ApiProperty({
    description: 'Datos de la respuesta',
  })
  data: T

  @ApiProperty({
    description: 'Array de errores (vacío si success es true)',
    example: [],
  })
  errors: string[]
}

// DTO específico para los datos del token en la respuesta de login
export class TokenDataDto {
  @ApiProperty({
    description: 'Token JWT de autenticación',
    example: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
  })
  @IsString()
  token: string

  @ApiProperty({
    description: 'ID del usuario autenticado',
    example: 3,
  })
  @IsNumber()
  user_id: number

  @ApiProperty({
    description: 'Fecha y hora de expiración del token',
    example: '2025-08-28 07:48:38',
  })
  @IsString()
  token_expires_at: string

  @ApiPropertyOptional({
    description: 'Fecha y hora de expiración de la firma',
    example: null,
  })
  @IsOptional()
  signature_expires_at?: string | null
}

// DTO para la respuesta completa de login
export class LoginResponseDto extends ApiResponseDto<TokenDataDto> {
  @ApiProperty({
    description: 'Datos del token de autenticación',
  })
  data: TokenDataDto
}

// DTO para configuración de billing
export class BillingConfigResponseDto {
  @ApiProperty({
    description: 'ID de la configuración',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string

  @ApiProperty({
    description: 'Email configurado',
    example: 'facturacion@empresa.com',
  })
  email: string

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2025-08-27T10:30:00.000Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Fecha de actualización',
    example: '2025-08-27T10:30:00.000Z',
  })
  updatedAt: Date
}

// DTO para estado de credenciales
export class CredentialsStatusDto {
  @ApiProperty({
    description: 'Indica si hay credenciales configuradas',
    example: true,
  })
  @IsBoolean()
  hasCredentials: boolean

  @ApiPropertyOptional({
    description: 'Email de las credenciales configuradas',
    example: 'facturacion@empresa.com',
  })
  @IsOptional()
  @IsString()
  email?: string
}

// DTO para test de conexión
export class ConnectionTestDto {
  @ApiProperty({
    description: 'Indica si la conexión fue exitosa',
    example: true,
  })
  @IsBoolean()
  isConnected: boolean

  @ApiProperty({
    description: 'Mensaje del resultado de la prueba',
    example: 'Conexión exitosa con la API de facturación',
  })
  @IsString()
  message: string

  @ApiPropertyOptional({
    description: 'Detalles adicionales del error (si existe)',
    example: 'ECONNREFUSED - La API no está disponible',
  })
  @IsOptional()
  @IsString()
  error?: string
}
