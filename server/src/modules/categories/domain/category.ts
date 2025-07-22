import { Allow } from 'class-validator'
import { FileType } from '@/modules/files/domain/file'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { CategoryStatus } from '@/modules/categories/category-status.enum'

export class Category {
  @ApiProperty({
    type: String,
    example: '63ee8a88-ed2e-4499-9190-e65ee225ee66',
  })
  @Allow()
  id: string

  @ApiProperty({
    type: String,
    example: 'Categoria uno',
  })
  name: string | null

  @ApiProperty({
    type: String,
    example: 'Descripción de la categoria uno',
  })
  description?: string | null

  @ApiProperty({
    type: () => FileType,
  })
  photo?: FileType | null

  @ApiProperty({
    enum: CategoryStatus,
    enumName: 'CategoryStatus',
    example: CategoryStatus.ACTIVE,
  })
  status: CategoryStatus

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
