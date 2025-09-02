import { IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ParamSaleDto {
  @ApiProperty({
    type: String,
    example: 'd7a2d85d-453c-4ed0-a2cf-c2099aafdfe4',
    description: 'UUID v4 de la venta',
  })
  @IsUUID('4', {
    message: 'El ID de venta proporcionado no es válido',
  })
  id: string
}
