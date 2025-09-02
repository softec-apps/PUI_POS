import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsOptional, IsUrl } from 'class-validator'

export class ResendWebhookDto {
  @ApiProperty({ description: 'ID de la venta asociada' })
  @IsString()
  saleId: string

  @ApiProperty({ description: 'URL callback para el webhook', required: false })
  @IsUrl()
  @IsOptional()
  callbackUrl?: string
}
