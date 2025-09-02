'use client'

import { useCallback } from 'react'
import { Icons } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { I_Brand } from '@/common/types/modules/brand'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface UserActionsProps {
	recordData: I_Brand
	onEdit: (recordData: I_Brand) => void
	onHardDelete: (recordData: I_Brand) => void
	onSoftDelete: (recordData: I_Brand) => void
	onRestore: (recordData: I_Brand) => void
}

export const Actions = ({ recordData, onEdit, onSoftDelete, onHardDelete, onRestore }: UserActionsProps) => {
	const router = useRouter()

	const handleViewDetails = useCallback(() => {
		router.push(`${ROUTE_PATH.ADMIN.USER}/${recordData.id}`)
	}, [router, recordData.id])

	const handleEdit = useCallback(() => {
		onEdit(recordData)
	}, [onEdit, recordData])

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
					<>
						<DropdownMenuItem
							variant='default'
							onClick={() => onSoftDelete(recordData)}
							className='flex cursor-pointer items-center rounded-xl'>
							<Icons.progressX />
							<span>Remover</span>
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
