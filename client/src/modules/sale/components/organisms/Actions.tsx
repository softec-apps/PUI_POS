'use client'

import { useCallback } from 'react'
import { Icons } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { I_Sale } from '@/common/types/modules/sale'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface ActionsProps {
	recordData: I_Sale
	onViewBill: (recordData: I_Sale) => void
}

export const Actions = ({ recordData, onViewBill }: ActionsProps) => {
	const router = useRouter()

	const handleViewDetails = useCallback(
		() => router.push(`${ROUTE_PATH.ADMIN.SALES}/${recordData.id}`),
		[router, recordData.id]
	)

	const handleViewBill = useCallback(() => onViewBill(recordData), [onViewBill, recordData])

	return (
		<>
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
					<DropdownMenuItem onClick={handleViewDetails} className='flex items-center gap-2 rounded-xl'>
						<Icons.eye />
						<span>Detalles venta</span>
					</DropdownMenuItem>

					<DropdownMenuItem onClick={handleViewBill} className='flex items-center gap-2 rounded-xl'>
						<Icons.file />
						<span>Ver documentos</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	)
}
