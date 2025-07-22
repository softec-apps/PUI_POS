import { ApiProperty } from '@nestjs/swagger'
import { BaseSuccessResponseDto } from '@/utils/dto/responseBase.dto'

// 200 OK - For GET, PUT, DELETE
export class OkResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Operación exitosa' })
  message: string
}

// 201 Created - For POST
export class CreatedResponseDto extends BaseSuccessResponseDto {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 201 })
  statusCode: number = 201

  @ApiProperty({ example: 'Recurso creado exitosamente' })
  message: string
}

// 204 No Content - For DELETE operations that don't return data
export class NoContentResponseDto {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 204 })
  statusCode: number = 204

  @ApiProperty({ example: 'Recurso eliminado exitosamente' })
  message: string
}
