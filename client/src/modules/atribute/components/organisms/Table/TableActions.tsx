'use client'

import { Icons } from '@/components/icons'
import { I_Attribute } from '@/common/types/modules/attribute'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Props {
	atributeData: I_Attribute
	onEdit: (atributeData: I_Attribute) => void
	onHardDelete: (atributeData: I_Attribute) => void
	onViewDetails?: () => void
}

export const TableActions = ({ atributeData, onEdit, onHardDelete, onViewDetails }: Props) => (
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
				onClick={() => onEdit(atributeData)}
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
				onClick={() => onHardDelete(atributeData)}
				className='flex cursor-pointer items-center rounded-xl'>
				<Icons.trash />
				<span>Eliminar</span>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
)
