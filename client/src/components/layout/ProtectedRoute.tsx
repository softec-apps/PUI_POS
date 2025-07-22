'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'

interface ProtectedRouteProps {
	children: React.ReactNode
	fallbackUrl?: string
}

export function ProtectedRoute({ children, fallbackUrl = '/' }: ProtectedRouteProps) {
	const { status } = useSession()

	const router = useRouter()
	const params = useParams()
	const locale = params.locale as string

	useEffect(() => {
		if (status === 'unauthenticated') router.push(`/${locale}${fallbackUrl}`)
	}, [status, router, locale, fallbackUrl])

	// Mientras carga la sesión, mostrar spinner
	if (status === 'loading') {
		return (
			<div className='bg-background flex h-screen items-center justify-center'>
				<SpinnerLoader />
			</div>
		)
	}

	// Si no está autenticado, mostrar spinner mientras redirige
	if (status === 'unauthenticated') {
		return (
			<div className='flex h-screen items-center justify-center'>
				<SpinnerLoader />
			</div>
		)
	}

	// Si está autenticado, mostrar el contenido
	return <>{children}</>
}
