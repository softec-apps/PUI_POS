'use client'

import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserAvatarProfileProps {
	showInfo?: boolean
}

export function UserAvatarProfile({ showInfo = false }: UserAvatarProfileProps) {
	const { data: userSession } = useSession()
	const user = userSession?.user || null

	// Extraer datos del usuario
	const imageUrl = user?.image || ''
	const firstName = user?.firstName || ''
	const lastName = user?.lastName || ''
	const fullName = `${firstName} ${lastName}`.trim()

	return (
		<div className='bg-muted/50 flex items-center gap-1.5 rounded-full border p-0.5'>
			<Avatar className='h-7 w-7 border'>
				<AvatarImage src={imageUrl} alt={fullName} />
				<AvatarFallback className='rounded-lg'>{fullName.slice(0, 2).toUpperCase() || 'US'}</AvatarFallback>
			</Avatar>

			{showInfo && (
				<div className='grid flex-1 pr-1.5 text-left text-xs leading-tight'>
					<span className='truncate font-semibold'>{fullName}</span>
				</div>
			)}
		</div>
	)
}
