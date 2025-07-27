'use client'

import { Icons } from '@/components/icons'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { UtilBanner } from '@/components/UtilBanner'
import { AlertMessage } from '@/components/layout/atoms/Alert'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ReactNode, useCallback, useMemo } from 'react'
import { useUserData, clearUserCache } from '@/common/hooks/useSession'

export interface Role {
	id: number
	name: 'admin' | 'manager'
}

interface AuthGuardProps {
	children: ReactNode
	requiredRole?: Role['name'] | Role['name'][] // Permite uno o múltiples roles
	fallback?: ReactNode // Componente personalizado para mostrar mientras carga
}

// Componente de estado no autorizado optimizado
const UnauthorizedState = ({ onRetry, error }: { onRetry?: () => void; error?: string | null }) => {
	const router = useRouter()

	const handleGoBack = useCallback(() => router.back(), [router])

	return (
		<div className='flex min-h-screen flex-col items-center justify-center'>
			<Card className='w-full max-w-md border-none bg-transparent shadow-none'>
				<CardHeader>
					<UtilBanner icon={<Icons.alertCircle />} title='Acceso restringido' />
				</CardHeader>

				<CardContent className='space-y-6'>
					<AlertMessage
						variant='destructive'
						title='Permisos insuficientes'
						message={error || 'No tienes los privilegios necesarios para acceder a este recurso'}
					/>
					<div className='flex flex-col items-center justify-center gap-3 sm:flex-row'>
						<ActionButton icon={<Icons.iconArrowLeft />} text='Volver atrás' onClick={handleGoBack} variant='ghost' />
						{onRetry && <ActionButton text='Reintentar' icon={<Icons.refresh />} onClick={onRetry} variant='default' />}
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

// Componente de carga optimizado
const LoadingState = ({ fallback }: { fallback?: ReactNode }) => {
	if (fallback) return <>{fallback}</>

	return (
		<div className='flex min-h-screen items-center justify-center'>
			<SpinnerLoader />
		</div>
	)
}

// Componente para usuario no autenticado en NextAuth
const UnauthenticatedState = () => {
	const router = useRouter()

	const handleLogin = useCallback(() => {
		router.push('/sign-in') // Ajusta la ruta según tu configuración
	}, [router])

	return (
		<div className='flex min-h-screen flex-col items-center justify-center'>
			<Card className='w-full max-w-md border-none bg-transparent shadow-none'>
				<CardHeader>
					<UtilBanner icon={<Icons.user />} title='Sesión requerida' />
				</CardHeader>

				<CardContent className='space-y-6'>
					<AlertMessage
						variant='warning'
						title='Autenticación necesaria'
						message='Debes iniciar sesión para acceder a este contenido'
					/>
					<div className='flex justify-center'>
						<ActionButton text='Iniciar sesión' icon={<Icons.login />} onClick={handleLogin} variant='default' />
					</div>
				</CardContent>
			</Card>
		</div>
	)
}

export function RoleGuard({ children, requiredRole, fallback }: AuthGuardProps) {
	const { data: session, status: sessionStatus } = useSession()
	const { userData, loading: userLoading, error, retry, userRole, isAuthenticated } = useUserData()

	// Función para reintentar que limpia tanto el cache como reintenta
	const handleRetry = useCallback(() => {
		clearUserCache()
		retry()
	}, [retry])

	// Memoizar componentes para evitar re-renders innecesarios
	const loadingComponent = useMemo(() => <LoadingState fallback={fallback} />, [fallback])

	const unauthorizedComponent = useMemo(
		() => <UnauthorizedState onRetry={handleRetry} error={error} />,
		[handleRetry, error]
	)

	const unauthenticatedComponent = useMemo(() => <UnauthenticatedState />, [])

	// Si NextAuth está cargando
	if (sessionStatus === 'loading') return loadingComponent

	// Si no hay sesión en NextAuth
	if (sessionStatus === 'unauthenticated' || !session) return unauthenticatedComponent

	// Si estamos cargando datos del usuario desde la API
	if (userLoading) return loadingComponent

	// Si hay error o el usuario no está autenticado según la API
	if (error || !isAuthenticated || !userData) return unauthorizedComponent

	// Verificar rol si es requerido
	if (requiredRole) {
		const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
		if (!userRole || !allowedRoles.includes(userRole)) return unauthorizedComponent
	}

	// Si todo está bien, renderizar los children
	return <>{children}</>
}

// Hook personalizado que combina NextAuth con datos de usuario de la API
export const useAuthUser = () => {
	const { data: session, status } = useSession()
	const { userData, loading: userLoading, error, userRole, isAuthenticated } = useUserData()

	const isLoading = status === 'loading' || userLoading
	const isSessionAuthenticated = status === 'authenticated' && !!session
	const isFullyAuthenticated = isSessionAuthenticated && isAuthenticated

	return {
		// Datos de NextAuth
		session,
		sessionStatus: status,

		// Datos de la API
		user: userData,
		userRole,

		// Estados combinados
		loading: isLoading,
		error,
		isAuthenticated: isFullyAuthenticated,
		isSessionOnly: isSessionAuthenticated && !isAuthenticated, // Tiene sesión pero no datos de API válidos
	}
}
