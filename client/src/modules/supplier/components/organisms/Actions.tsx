'use client'

import { useCallback } from 'react'
import { Icons } from '@/components/icons'
import { I_Supplier } from '@/common/types/modules/supplier'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface UserActionsProps {
	recordData: I_Supplier
	onViewDetail: (recordData: I_Supplier) => void
	onEdit: (recordData: I_Supplier) => void
	onHardDelete: (recordData: I_Supplier) => void
	onSoftDelete: (recordData: I_Supplier) => void
	onRestore: (recordData: I_Supplier) => void
}

export const Actions = ({
	recordData,
	onEdit,
	onSoftDelete,
	onHardDelete,
	onRestore,
	onViewDetail,
}: UserActionsProps) => {
	const handleViewDetails = useCallback(() => onViewDetail(recordData), [onViewDetail, recordData])

	const handleEdit = useCallback(() => onEdit(recordData), [onEdit, recordData])

	return (
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
				<DropdownMenuItem onClick={handleViewDetails} className='flex cursor-pointer items-center gap-2 rounded-xl'>
					<Icons.eye />
					<span>Ver Detalles</span>
				</DropdownMenuItem>

				<DropdownMenuItem onClick={handleEdit} className='flex cursor-pointer items-center gap-2 rounded-xl'>
					<Icons.pencilMinus />
					<span>Editar</span>
				</DropdownMenuItem>

				{recordData.deletedAt ? (
					<>
						<DropdownMenuItem
							variant='default'
							onClick={() => onRestore(recordData)}
							className='flex cursor-pointer items-center rounded-xl'>
							<Icons.progressCheck />
							<span>Restaurar</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							variant='destructive'
							onClick={() => onHardDelete(recordData)}
							className='flex cursor-pointer items-center rounded-xl'>
							<Icons.trash />
							<span>Eliminar</span>
						</DropdownMenuItem>
					</>
				) : (
					<DropdownMenuItem
						variant='default'
						onClick={() => onSoftDelete(recordData)}
						className='flex cursor-pointer items-center rounded-xl'>
						<Icons.progressX />
						<span>Remover</span>
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
