import { IsUUID } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class ParamAtributeDto {
  @ApiProperty({
    type: String,
    example: '63ee8a88-ed2e-4499-9190-e65ee225ee66',
  })
  @IsUUID()
  id: string
}
