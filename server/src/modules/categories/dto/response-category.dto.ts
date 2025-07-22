import { ApiProperty } from '@nestjs/swagger'

export class MetaDto {
  @ApiProperty({ example: '2025-06-23T19:41:01.120Z' })
  timestamp: string

  @ApiProperty({ example: 'categories' })
  resource: string

  @ApiProperty({ example: 'create' })
  method: string
}

// DTO base genérico
export class ResponseCategoryDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({ example: 201 })
  statusCode: number

  @ApiProperty({ example: 'Operación completada exitosamente' })
  message: string

  @ApiProperty({ type: () => Object, required: false })
  data?: T

  @ApiProperty({ type: MetaDto })
  meta: MetaDto
}

// DTOs específicos para cada operación CRUD
export class CreateCategoryResponseDto<T = any> extends ResponseCategoryDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 201 })
  statusCode: number = 201

  @ApiProperty({ example: 'Categoria creada exitosamente' })
  message: string = 'Categoria creada exitosamente'
}

export class UpdateCategoryResponseDto<T = any> extends ResponseCategoryDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Categoria actualizada exitosamente' })
  message: string = 'Categoria actualizada exitosamente'
}

export class FindOneCategoryResponseDto<
  T = any,
> extends ResponseCategoryDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Categoria obtenida exitosamente' })
  message: string = 'Categoria obtenida exitosamente'
}

export class FindAllCategoryResponseDto<T = any> extends ResponseCategoryDto<
  T[]
> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Categorias listadas exitosamente' })
  message: string = 'Categorias listadas exitosamente'

  @ApiProperty({ type: [Object] })
  data?: T[]
}

export class DeleteCategoryResponseDto<T = any> extends ResponseCategoryDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Categoria eliminada exitosamente' })
  message: string = 'Categoria eliminada exitosamente'
}

export class HardDeleteCategoryResponseDto<
  T = any,
> extends ResponseCategoryDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Categoria eliminada permanentemente' })
  message: string = 'Categoria eliminada permanentemente'
}
