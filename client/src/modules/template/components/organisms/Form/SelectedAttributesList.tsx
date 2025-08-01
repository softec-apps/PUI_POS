'use client'

import { Icons } from '@/components/icons'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { I_Attribute } from '@/modules/atribute/types/attribute'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { AttributeTypeAllow, typeLabelsTraslateToEs } from '@/modules/atribute/enums/attribute-types-allow.enum'

interface Props {
	attributes: I_Attribute[]
	onRemoveAll: () => void
	onRemoveAttribute: (id: string) => void
}

export function SelectedAttributesList({ attributes, onRemoveAll, onRemoveAttribute }: Props) {
	return (
		<div className='space-y-3'>
			<div className='flex items-center justify-between'>
				<Label>Atributos seleccionados ({attributes.length})</Label>
				<ActionButton icon={<Icons.x />} onClick={onRemoveAll} variant='ghost' size='sm' text='Remover todo' />
			</div>

			<ScrollArea className='h-64'>
				<div className='space-y-2 pr-4'>
					{attributes.map(attr => (
						<div key={attr.id} className='flex items-center justify-between rounded-lg border p-3'>
							<div className='flex items-center gap-3'>
								<div>
									<p className='text-sm font-medium'>{attr.name}</p>
									<p className='text-muted-foreground text-xs'>
										Tipo: {typeLabelsTraslateToEs[attr.type as AttributeTypeAllow] || 'Desconocido'}
									</p>
									<p className='text-muted-foreground text-xs'>{attr.required ? 'Requerido' : 'Opcional'}</p>
								</div>
							</div>

							<ActionButton
								icon={<Icons.x />}
								onClick={() => onRemoveAttribute(attr.id)}
								variant='ghost'
								size='icon'
								tooltip='Remover'
							/>
						</div>
					))}
				</div>
			</ScrollArea>
		</div>
	)
}
