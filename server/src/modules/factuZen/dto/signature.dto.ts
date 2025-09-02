import { IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UploadSignatureDto {
  @ApiProperty({
    description:
      'Archivo de la firma digital (.p12). Puede enviarse como base64 o buffer',
    type: 'string',
    format: 'binary',
    example: 'firma.p12',
  })
  signature_file: any

  @ApiProperty({
    description: 'Clave de la firma digital',
    example: '123456',
  })
  @IsString()
  signature_key: string
}
