'use client'

import { useCallback } from 'react'
import { Icons } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { I_User } from '@/common/types/modules/user'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface TableActionsProps {
	recordData: I_User
	onEdit: (recordData: I_User) => void
	onHardDelete: (recordData: I_User) => void
	onSoftDelete: (recordData: I_User) => void
}

export const TableActions = ({ recordData, onEdit, onSoftDelete, onHardDelete }: TableActionsProps) => {
	const router = useRouter()

	// ✅ Memoizar las funciones para evitar re-renders innecesarios
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
					<DropdownMenuItem
						variant='destructive'
						onClick={() => onHardDelete(recordData)}
						className='flex cursor-pointer items-center rounded-xl'>
						<Icons.trash />
						<span>Eliminar</span>
					</DropdownMenuItem>
				) : (
					<>
						<DropdownMenuItem
							variant='default'
							onClick={() => onSoftDelete(recordData)}
							className='flex cursor-pointer items-center rounded-xl'>
							<Icons.trash />
							<span>Remover</span>
						</DropdownMenuItem>
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
