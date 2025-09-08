import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { logout } from '@/shared/services/auth.service'
import { ROUTE_PATH } from '@/common/constants/routes-const'

export function useLogout() {
	const [isLoading, setIsLoading] = useState(false)

	const handleLogout = async () => {
		try {
			setIsLoading(true)
			await logout()
			await signOut({
				callbackUrl: `${ROUTE_PATH.AUTH.SIGNIN}`,
			})
		} catch (error) {
			console.error('Error al cerrar sesión:', error)
			setIsLoading(false)
			throw error // Re-throw for component handling if needed
		}
	}

	return {
		isLoading,
		handleLogout,
	}
}
