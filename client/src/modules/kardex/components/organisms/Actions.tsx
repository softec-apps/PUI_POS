'use client'

import { useCallback } from 'react'
import { Icons } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { I_Kardex } from '@/common/types/modules/kardex'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface UserActionsProps {
	recordData: I_Kardex
}

export const Actions = ({ recordData }: UserActionsProps) => {
	const router = useRouter()

	const handleViewDetails = useCallback(() => {
		router.push(`${ROUTE_PATH.ADMIN.KARDEX}/${recordData.product.id}`)
	}, [router, recordData.product.id])

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
					<span>Detalles</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
