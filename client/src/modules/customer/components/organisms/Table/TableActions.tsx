'use client'

import { Icons } from '@/components/icons'
import { I_Customer } from '@/common/types/modules/customer'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTE_PATH } from '@/common/constants/routes-const'

interface TableActionsProps {
	recordData: I_Customer
	onEdit: (recordData: I_Customer) => void
	onHardDelete: (recordData: I_Customer) => void
}

export const TableActions = ({ recordData, onEdit, onHardDelete }: TableActionsProps) => {
	const router = useRouter()

	const handleViewDetails = useCallback(() => {
		router.push(`${ROUTE_PATH.ADMIN.CUSTOMERS}/${recordData.id}`)
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

			<DropdownMenuContent align='end' className='dark:border-border/50 rounded-2xl border shadow-none'>
				<DropdownMenuItem
					onClick={handleEdit}
					className='text-muted-foreground flex cursor-pointer items-center gap-2 rounded-xl'>
					<Icons.pencilMinus />
					<span>Editar</span>
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={handleViewDetails}
					className='text-muted-foreground flex cursor-pointer items-center gap-2 rounded-xl'>
					<Icons.eye />
					<span>Detalles</span>
				</DropdownMenuItem>

				<DropdownMenuItem
					variant='destructive'
					onClick={handleDelete}
					className='flex cursor-pointer items-center rounded-xl'>
					<Icons.trash />
					<span>Eliminar</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
