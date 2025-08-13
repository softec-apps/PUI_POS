'use client'

import { Icons } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { I_Customer } from '@/common/types/modules/customer'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import { useCallback } from 'react'

interface Props {
	customerData: I_Customer
	onEdit: (customerData: I_Customer) => void
	onHardDelete: (customerData: I_Customer) => void
}

export const TableActions = ({ customerData, onEdit, onHardDelete }: Props) => {
	const router = useRouter()

	const handleViewDetails = useCallback(() => {
		router.push(`${ROUTE_PATH.ADMIN.CUSTOMERS}/${customerData.id}`)
	}, [router, customerData.id])

	const handleEdit = useCallback(() => {
		onEdit(customerData)
	}, [onEdit, customerData])

	const handleDelete = useCallback(() => {
		onHardDelete(customerData)
	}, [onHardDelete, customerData])

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

				<DropdownMenuItem onClick={handleViewDetails} className='flex cursor-pointer items-center gap-2 rounded-xl'>
					<Icons.eye />
					<span>Detalles</span>
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
