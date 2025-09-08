'use client'

import { useAuth } from '@/common/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserAvatarProfileProps {
	showInfo?: boolean
}

export function UserAvatarProfile({ showInfo = false }: UserAvatarProfileProps) {
	const { user, isLoadingUser } = useAuth()

	// Mostrar loading state mientras carga
	if (isLoadingUser) {
		return (
			<div className='bg-muted/50 flex items-center gap-1.5 rounded-full border p-0.5'>
				<div className='bg-muted h-7 w-7 animate-pulse rounded-full border' />
				{showInfo && (
					<div className='grid flex-1 pr-1.5 text-left text-xs leading-tight'>
						<div className='bg-muted h-3 animate-pulse rounded' />
					</div>
				)}
			</div>
		)
	}

	// Si no hay usuario, mostrar avatar por defecto
	if (!user) {
		return (
			<div className='bg-muted/50 flex items-center gap-1.5 rounded-full border p-0.5'>
				<Avatar className='h-7 w-7 border'>
					<AvatarFallback className='rounded-lg'>??</AvatarFallback>
				</Avatar>
				{showInfo && (
					<div className='grid flex-1 pr-1.5 text-left text-xs leading-tight'>
						<span className='text-muted-foreground truncate font-semibold'>No autenticado</span>
					</div>
				)}
			</div>
		)
	}

	// Extraer datos del usuario
	const imageUrl = user.photo?.path || ''
	const firstName = user.firstName || ''
	const lastName = user.lastName || ''
	const fullName = `${firstName} ${lastName}`.trim()
	const email = user.email || ''

	// Generar iniciales para el fallback
	const initials = fullName
		? fullName
				.split(' ')
				.map(name => name.charAt(0))
				.join('')
				.slice(0, 2)
				.toUpperCase()
		: email.charAt(0).toUpperCase()

	return (
		<div className='bg-muted/50 flex items-center gap-1.5 rounded-full border p-0.5'>
			<Avatar className='h-7 w-7 border'>
				<AvatarImage src={imageUrl} alt={fullName || email} />
				<AvatarFallback className='rounded-lg'>{initials}</AvatarFallback>
			</Avatar>
			{showInfo && (
				<div className='grid flex-1 pr-1.5 text-left text-xs leading-tight'>
					<span className='truncate font-semibold'>{fullName || email}</span>
					{fullName && <span className='text-muted-foreground truncate'>{email}</span>}
				</div>
			)}
		</div>
	)
}
