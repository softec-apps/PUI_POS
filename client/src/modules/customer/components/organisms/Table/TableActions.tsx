'use client'

import { Icons } from '@/components/icons'
import { I_Customer } from '@/common/types/modules/customer'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface TableActionsProps {
	recordData: I_Customer
	onEdit: (recordData: I_Customer) => void
	onHardDelete: (recordData: I_Customer) => void
	onViewDetails?: () => void
}

export const TableActions = ({ recordData, onEdit, onHardDelete, onViewDetails }: TableActionsProps) => (
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
				onClick={() => onEdit(recordData)}
				className='text-muted-foreground flex cursor-pointer items-center gap-2 rounded-xl'>
				<Icons.pencilMinus />
				<span>Editar</span>
			</DropdownMenuItem>

			<DropdownMenuItem
				variant='destructive'
				onClick={() => onHardDelete(recordData)}
				className='flex cursor-pointer items-center rounded-xl'>
				<Icons.trash />
				<span>Eliminar</span>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
)
