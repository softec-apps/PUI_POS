'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/icons'
import { I_Template } from '@/common/types/modules/template'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

interface Props {
	recordData: I_Template
	onEdit: (recordData: I_Template) => void
	onHardDelete: (recordData: I_Template) => void
	onViewDetails?: () => void
}

export const TableActions = ({ recordData, onEdit, onHardDelete, onViewDetails }: Props) => (
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

		<DropdownMenuContent align='end' className='border-border/50 rounded-2xl border'>
			<DropdownMenuItem
				onClick={() => onEdit(recordData)}
				className='flex cursor-pointer items-center gap-2 rounded-xl'>
				<Icons.pencilMinus />
				<span>Editar</span>
			</DropdownMenuItem>

			<DropdownMenuItem onClick={onViewDetails} className='flex cursor-pointer items-center gap-2 rounded-xl'>
				<Icons.eye />
				<span>Detalles</span>
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
