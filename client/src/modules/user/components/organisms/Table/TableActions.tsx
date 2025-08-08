'use client'

import { Icons } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { I_User } from '@/modules/user/types/user'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import { useCallback } from 'react'

interface Props {
	recordData: I_User
	onEdit: (recordData: I_User) => void
	onHardDelete: (recordData: I_User) => void
}

export const TableActions = ({ recordData, onEdit, onHardDelete }: Props) => {
	const router = useRouter()

	// ✅ Memoizar las funciones para evitar re-renders innecesarios
	const handleViewDetails = useCallback(() => {
		router.push(`${ROUTE_PATH.ADMIN.USER}/${recordData.id}`)
	}, [router, recordData.id])

	const handleEdit = useCallback(() => {
		onEdit(recordData)
	}, [onEdit, recordData])

	const handleDelete = useCallback(() => {
		onHardDelete(recordData)
	}, [onHardDelete, recordData])

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

				<DropdownMenuItem
					onClick={handleDelete}
					className='text-destructive hover:text-destructive flex cursor-pointer items-center gap-2 rounded-xl'>
					<Icons.trash />
					<span>Eliminar</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
