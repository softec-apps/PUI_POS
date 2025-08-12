'use client'

import { Icons } from '@/components/icons'
import { I_Customer } from '@/common/types/modules/customer'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface TableActionsProps {
	categoryData: I_Customer
	onEdit: (categoryData: I_Customer) => void
	onHardDelete: (categoryData: I_Customer) => void
	onViewDetails?: () => void
}

export const TableActions = ({ categoryData, onEdit, onHardDelete, onViewDetails }: TableActionsProps) => (
	<DropdownMenu>
		<DropdownMenuTrigger asChild>
			<ActionButton
				icon={<Icons.dotsVertical />}
				variant='ghost'
				tooltip='Ver Acciones'
				size='icon'
				className='rounded-full'
			/>
		</DropdownMenuTrigger>

		<DropdownMenuContent align='end' className='dark:border-border/50 rounded-2xl border shadow-none'>
			<DropdownMenuItem
				onClick={() => onEdit(categoryData)}
				className='text-muted-foreground flex cursor-pointer items-center gap-2 rounded-xl'>
				<Icons.pencilMinus />
				<span>Editar</span>
			</DropdownMenuItem>

			<DropdownMenuItem
				onClick={onViewDetails}
				className='text-muted-foreground flex cursor-pointer items-center gap-2 rounded-xl'>
				<Icons.eye />
				<span>Detalles</span>
			</DropdownMenuItem>

			<DropdownMenuItem
				variant='destructive'
				onClick={() => onHardDelete(categoryData)}
				className='flex cursor-pointer items-center rounded-xl'>
				<Icons.trash />
				<span>Eliminar</span>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
)
