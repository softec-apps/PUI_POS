'use client'

import { Icons } from '@/components/icons'
import { Label } from '@/components/ui/label'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

interface SelectedCategoryDisplayProps {
	category: { id: string; name?: string }
	categoryOptions: Array<{ value: string; label: string }>
	onRemove: () => void
}

export function SelectedCategoryDisplay({ category, categoryOptions, onRemove }: SelectedCategoryDisplayProps) {
	return (
		<div className='space-y-3'>
			<div className='flex items-center justify-between'>
				<Label>Categoría seleccionada</Label>
			</div>

			<div className='space-y-2 pr-4'>
				<div className='bg-background/70 flex items-center justify-between rounded-lg border p-3 shadow-sm'>
					<div className='flex items-center gap-3'>
						<Icons.folder className='h-4 w-4' />
						<div>
							<p className='text-sm font-medium'>
								{category.name || categoryOptions.find(c => c.value === category.id)?.label}
							</p>
						</div>
					</div>

					<ActionButton
						type='button'
						variant='ghost'
						onClick={onRemove}
						tooltip='Remover selección'
						icon={<Icons.x className='h-4 w-4' />}
					/>
				</div>
			</div>
		</div>
	)
}
