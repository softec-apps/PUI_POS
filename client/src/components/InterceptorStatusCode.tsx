'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { emitter } from '@/common/events/sessionEmitter-event'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import { ActionButton } from './layout/atoms/ActionButton'
import { Icons } from './icons'
import { Card, CardContent, CardHeader } from './ui/card'
import { UtilBanner } from './UtilBanner'
import { AlertMessage } from './layout/atoms/Alert'

export function InterceptorStatusCode({ children }: { children: React.ReactNode }) {
	const [errorState, setErrorState] = useState<{ type: '401' | '403' } | null>(null)
	const { data: session, update } = useSession()
	const router = useRouter()
	const pathname = usePathname() // obtiene la ruta actual

	// 🧹 Resetea el estado de error al cambiar de ruta (navegación)
	useEffect(() => {
		setErrorState(null)
	}, [pathname]) // se ejecuta cada vez que cambias de ruta

	const goBack = () => {
		if (window.history.length > 1) {
			window.history.back()
		} else {
			router.push(ROUTE_PATH.HOME)
		}
	}

	const handleExtendSession = async () => {
		try {
			const updatedSession = await update()
			if (updatedSession?.error === 'RefreshAccessTokenError') {
				await signOut({ callbackUrl: ROUTE_PATH.AUTH.SIGNIN })
			} else if (updatedSession) {
				setErrorState(null)
				window.location.reload()
			} else {
				await signOut({ callbackUrl: ROUTE_PATH.AUTH.SIGNIN })
			}
		} catch (error) {
			console.error('Error al extender la sesión:', error)
			await signOut({ callbackUrl: ROUTE_PATH.AUTH.SIGNIN })
		}
	}

	const handleLogout = async () => {
		try {
			await signOut({
				callbackUrl: ROUTE_PATH.AUTH.SIGNIN,
				redirect: true,
			})
		} catch (error) {
			console.error('Error al cerrar sesión:', error)
			window.location.href = ROUTE_PATH.AUTH.SIGNIN
		}
	}

	const container = {
		hidden: { opacity: 0 },
		visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
	}

	const item = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { type: 'lineal', stiffness: 50 },
		},
	}

	useEffect(() => {
		const on401 = () => setErrorState({ type: '401' })
		const on403 = () => setErrorState({ type: '403' })

		emitter.on('unauthorized', on401)
		emitter.on('forbidden', on403)

		return () => {
			emitter.off('unauthorized', on401)
			emitter.off('forbidden', on403)
		}
	}, [])

	useEffect(() => {
		if (session?.error === 'RefreshAccessTokenError') {
			setErrorState({ type: '401' })
		}
	}, [session])

	if (errorState) {
		const { type } = errorState

		const errorConfig = {
			'401': {
				title: 'Sesión expirada',
				description: 'Tu sesión ha expirado. Por favor, extiéndela o inicia sesión nuevamente.',
				showSessionOptions: true,
			},
			'403': {
				title: 'Acceso denegado',
				description: 'No tienes permisos para acceder a esta sección.',
				showBackButton: true,
			},
		}

		const { title, description, showSessionOptions, showBackButton } = errorConfig[type]

		return (
			<div className='bg-background flex h-screen items-center justify-center'>
				<motion.div
					variants={container}
					initial='hidden'
					animate='visible'
					className='relative z-50 w-full max-w-md px-4 text-center'>
					<Card className='border-none bg-transparent shadow-none'>
						<CardHeader>
							<UtilBanner icon={<Icons.alertCircle />} title={title} />
						</CardHeader>

						<AlertMessage variant='destructive' message={description} />
					</Card>

					<motion.div variants={item} className='flex flex-col space-y-2 sm:space-y-3'>
						{showSessionOptions ? (
							<>
								<ActionButton text='Extender sesión' onClick={handleExtendSession} />
								<ActionButton
									icon={<Icons.iconArrowLeft />}
									text='Cerrar sesión'
									onClick={handleLogout}
									variant='outline'
								/>
							</>
						) : showBackButton ? (
							<>
								<ActionButton icon={<Icons.iconArrowLeft />} text='Volver atrás' onClick={goBack} className='w-full' />
								<ActionButton
									text='Intentar de nuevo'
									onClick={() => window.location.reload()}
									variant='ghost'
									className='w-full'
								/>
							</>
						) : null}
					</motion.div>
				</motion.div>
			</div>
		)
	}

	return <>{children}</>
}
