import { ApiProperty } from '@nestjs/swagger'
import { AtributeTypeAllow } from '@/modules/atributes/atribute-types-allow.enum'

export class Atribute {
  @ApiProperty({
    type: String,
    example: '63ee8a88-ed2e-4499-9190-e65ee225ee66',
    description: 'UUID del atributo',
  })
  id: string

  @ApiProperty({
    type: String,
    example: 'Color',
    nullable: true,
    description: 'Nombre del atributo',
  })
  name: string | null

  @ApiProperty({
    enum: AtributeTypeAllow,
    example: AtributeTypeAllow.TEXT,
    description: 'Tipo de dato del atributo',
  })
  type: AtributeTypeAllow

  @ApiProperty({
    type: [String],
    required: false,
    nullable: true,
    example: ['Rojo', 'Azul', 'Verde'],
    description: 'Opciones disponibles (solo si el tipo lo permite)',
  })
  options?: string[] | null

  @ApiProperty({
    type: Boolean,
    example: false,
    description: 'Indica si el atributo es obligatorio',
  })
  required: boolean

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
}
