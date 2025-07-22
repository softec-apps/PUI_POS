import { IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ParamTemplateDto {
  @ApiProperty({
    type: String,
    example: '63ee8a88-ed2e-4499-9190-e65ee225ee66',
    description: 'UUID v4',
  })
  @IsUUID('4', {
    message: 'El ID proporcionado no es válido',
  })
  id: string
}
