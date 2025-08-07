'use client'

import { Icons } from '@/components/icons'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { I_Attribute } from '@/common/types/modules/attribute'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { AttributeTypeAllow, typeLabelsTraslateToEs } from '@/modules/atribute/enums/attribute-types-allow.enum'
import { Badge } from '@/components/layout/atoms/Badge'
import { Typography } from '@/components/ui/typography'

interface Props {
	attributes: I_Attribute[]
	onRemoveAll: () => void
	onRemoveAttribute: (id: string) => void
}

export function SelectedAttributesList({ attributes, onRemoveAll, onRemoveAttribute }: Props) {
	return (
		<div className='space-y-3'>
			<div className='flex items-center justify-between'>
				<Label>Seleccionados ({attributes.length})</Label>
				<ActionButton icon={<Icons.x />} onClick={onRemoveAll} variant='ghost' size='sm' text='Remover todo' />
			</div>

			<ScrollArea className='h-64'>
				<div className='space-y-2 pr-4'>
					{attributes.map(attr => (
						<div
							key={attr.id}
							className='border-border/50 dark:bg-card/40 bg-accent/30 flex items-center justify-between rounded-xl border p-3'>
							<div className='flex items-center gap-3'>
								<div className='space-y-1'>
									<Typography variant='overline'>{attr.name} </Typography>
									<div className='space-x-2'>
										<Badge
											variant={attr.required ? 'success' : 'warning'}
											text={attr.required ? 'Requerido' : 'Opcional'}
										/>
										<Badge
											variant='default'
											text={typeLabelsTraslateToEs[attr.type as AttributeTypeAllow] || 'Desconocido'}
										/>
									</div>
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
