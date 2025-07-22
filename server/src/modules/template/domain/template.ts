import { Atribute } from '@/modules/atributes/domain/atribute'
import { Category } from '@/modules/categories/domain/category'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class Template {
  @ApiProperty({
    type: String,
    example: '21ab61e2-8bb3-457b-8871-7d4fd3d396e1',
    description: 'UUID de la plantilla',
  })
  id: string

  @ApiProperty({
    type: String,
    example: 'Plantilla de Producto',
    nullable: true,
    description: 'Nombre de la plantilla',
  })
  name: string | null

  @ApiPropertyOptional({
    type: String,
    example: 'Plantilla para gestionar productos de inventario',
    nullable: true,
    description: 'Descripción de la plantilla',
  })
  description?: string | null

  @ApiProperty({
    type: () => Category,
  })
  category?: Category | null

  @ApiPropertyOptional({
    type: () => [Atribute],
    nullable: true,
    description: 'Atributos asociados a la plantilla',
  })
  atributes?: Atribute[]

  @ApiProperty({
    type: Date,
    example: '2024-06-16T12:34:56.789Z',
    description: 'Fecha de creación',
  })
  createdAt: Date

  @ApiProperty({
    type: Date,
    example: '2024-06-16T15:00:00.000Z',
    description: 'Fecha de última actualización',
  })
  updatedAt: Date

  @ApiPropertyOptional({
    type: Date,
    example: '2024-07-01T09:00:00.000Z',
    description: 'Fecha de eliminación lógica (si aplica)',
    nullable: true,
  })
  deletedAt?: Date | null
}
