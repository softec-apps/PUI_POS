'use client'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Icons } from '@/components/icons'
import { logout } from '@/shared/services/auth.service'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

export function LogoutButton() {
	const [isLoading, setIsLoading] = useState(false)

	const handleLogout = async () => {
		try {
			setIsLoading(true)
			await logout()
			await signOut({
				callbackUrl: `${ROUTE_PATH.AUTH.SIGNIN}`,
				redirect: true,
			})
		} catch (error) {
			console.error('Error al cerrar sesión:', error)
			setIsLoading(false) // Solo si hay error, porque si es exitoso se redirige
		}
	}

	return (
		<ActionButton
			onClick={handleLogout}
			variant='secondary'
			icon={isLoading ? <Icons.spinnerSimple className='animate-spin' /> : <Icons.logout />}
			size='icon'
			tooltip={isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
			disabled={isLoading}
			className='hover:bg-destructive/70'
		/>
	)
}
