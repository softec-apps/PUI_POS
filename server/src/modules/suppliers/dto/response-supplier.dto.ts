import { ApiProperty } from '@nestjs/swagger'

export class MetaDto {
  @ApiProperty({ example: '2025-06-23T19:41:01.120Z' })
  timestamp: string

  @ApiProperty({ example: 'suppliers' })
  resource: string

  @ApiProperty({ example: 'create' })
  method: string
}

export class ResponseSupplierDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean

  @ApiProperty({ example: 201 })
  statusCode: number

  @ApiProperty({ example: 'Operación completada con éxito' })
  message: string

  @ApiProperty({ type: () => Object, required: false })
  data?: T

  @ApiProperty({ type: MetaDto })
  meta: MetaDto
}

// Specific DTOs for each CRUD operation
export class CreateSupplierResponseDto<T = any> extends ResponseSupplierDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 201 })
  statusCode: number = 201

  @ApiProperty({ example: 'Proveedor creado exitosamente' })
  message: string = 'Proveedor creado exitosamente'
}

export class UpdateSupplierResponseDto<T = any> extends ResponseSupplierDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Proveedor actualizado exitosamente' })
  message: string = 'Proveedor actualizado exitosamente'
}

export class FindOneSupplierResponseDto<
  T = any,
> extends ResponseSupplierDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Proveedor recuperado exitosamente' })
  message: string = 'Proveedor recuperado exitosamente'
}

export class FindAllSupplierResponseDto<T = any> extends ResponseSupplierDto<
  T[]
> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Proveedores listados exitosamente' })
  message: string = 'Proveedores listados exitosamente'

  @ApiProperty({ type: [Object] })
  data?: T[]
}

export class DeleteSupplierResponseDto<T = any> extends ResponseSupplierDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Proveedor eliminado exitosamente' })
  message: string = 'Proveedor eliminado exitosamente'
}

export class HardDeleteSupplierResponseDto<
  T = any,
> extends ResponseSupplierDto<T> {
  @ApiProperty({ example: true })
  success: boolean = true

  @ApiProperty({ example: 200 })
  statusCode: number = 200

  @ApiProperty({ example: 'Proveedor eliminado permanentemente' })
  message: string = 'Proveedor eliminado permanentemente'
}
