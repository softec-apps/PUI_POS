'use client'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/icons'
import { I_Sale } from '@/common/types/modules/sale'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

interface Props {
	saleData: I_Sale
	onEdit: (saleData: I_Sale) => void
	onHardDelete: (saleData: I_Sale) => void
	onViewDetails?: () => void
}

export const TableActions = ({ saleData, onEdit, onHardDelete, onViewDetails }: Props) => (
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
				onClick={() => onEdit(saleData)}
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
				onClick={() => onHardDelete(saleData)}
				className='flex cursor-pointer items-center rounded-xl'>
				<Icons.trash />
				<span>Eliminar</span>
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
)
