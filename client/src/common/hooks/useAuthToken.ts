import { useSession } from 'next-auth/react'
import { AuthSession } from '@/common/types/auth'

interface UseAuthTokenReturn {
	accessToken: string | undefined
	refreshToken: string | undefined
	user: AuthSession['user'] | undefined
	isAuthenticated: boolean
	isLoading: boolean
}

export function useAuthToken(): UseAuthTokenReturn {
	const { data: session, status } = useSession()

	return {
		accessToken: session?.accessToken,
		refreshToken: session?.refreshToken,
		user: session?.user,
		isAuthenticated: !!session,
		isLoading: status === 'loading',
	}
}
