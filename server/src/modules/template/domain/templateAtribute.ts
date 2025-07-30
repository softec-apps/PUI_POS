import { ApiProperty } from '@nestjs/swagger'
import { Atribute } from '@/modules/atributes/domain/atribute'

export class TemplateAtribute {
  @ApiProperty({ type: () => Atribute })
  atribute: Atribute

  @ApiProperty({
    type: Boolean,
    description: 'Indica si este atributo se usa para generar el SKU',
    default: false,
  })
  isSku: boolean

  @ApiProperty({
    type: Number,
    description: 'Orden en el que este atributo aparece en el SKU',
    default: 0,
  })
  skuOrder: number
}
