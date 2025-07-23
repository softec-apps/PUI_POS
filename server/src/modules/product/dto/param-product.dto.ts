import { ApiProperty } from '@nestjs/swagger'
import { IsUUID, IsNotEmpty, IsString } from 'class-validator'

export class ParamProductDto {
  @ApiProperty({
    type: String,
    description: 'ID único del producto',
    example: '63ee8a88-ed2e-4499-9190-e65ee225ee66',
    format: 'uuid',
    minLength: 36,
    maxLength: 36,
  })
  @IsNotEmpty({ message: 'El ID del producto es requerido' })
  @IsString({ message: 'El ID debe ser una cadena de texto' })
  @IsUUID('4', {
    message: 'Debe ser un UUIDv4 válido',
  })
  id: string
}
