'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'

import { Icons } from '@/components/icons'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

export default function Page404() {
	const { status } = useSession()

	const goBack = () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		window.history.length > 1 ? window.history.back() : (window.location.href = ROUTE_PATH.HOME)
	}

	// Animaciones simplificadas
	const container = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: { staggerChildren: 0.03 },
		},
	}

	const item = {
		hidden: { y: 50, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: { type: 'spring', stiffness: 120 },
		},
	}

	return (
		<div className='bg-background relative flex h-screen items-center justify-center overflow-hidden'>
			{/* Contenedor principal con z-index alto */}
			<motion.div
				variants={container}
				initial='hidden'
				animate='visible'
				className='relative z-10 w-full max-w-xs px-4 text-center'>
				{/* Número 404 */}
				<motion.div variants={item} className='relative'>
					<motion.span
						className='text-foreground/90 block text-7xl font-light tracking-tighter sm:text-8xl'
						animate={{
							textShadow: '0 0 5px rgba(255,255,255,0.2)',
							transition: {
								duration: 3,
								repeat: Infinity,
								repeatType: 'reverse',
							},
						}}>
						404
					</motion.span>
				</motion.div>

				{/* Divisor */}
				<motion.div
					variants={item}
					className='pt-4 sm:pt-6'
					initial={{ scaleX: 0 }}
					animate={{
						scaleX: 1,
						transition: { delay: 0.3, type: 'spring', stiffness: 80 },
					}}>
					<div className='via-foreground/15 h-px w-full bg-gradient-to-r from-transparent to-transparent' />
				</motion.div>

				{/* Mensaje */}
				<motion.div variants={item} className='mt-4 space-y-1 sm:mt-6'>
					<h2 className='text-foreground text-base font-medium sm:text-lg'>Recurso no encontrado</h2>
					<p className='text-foreground/60 text-xs sm:text-sm'>El contenido que buscas no existe o fue movido</p>
				</motion.div>

				{/* Botones con pointer-events auto */}
				<motion.div variants={item} className='mt-6 flex flex-col space-y-2 sm:mt-8 sm:space-y-3'>
					<ActionButton
						text='Volver atrás'
						icon={<Icons.iconArrowLeft />}
						onClick={goBack}
						className='w-full'
						variant='default'
					/>

					<Link
						href={status === 'unauthenticated' ? ROUTE_PATH.AUTH.SIGNIN : ROUTE_PATH.ADMIN.DASHBOARD}
						className='pointer-events-auto block'>
						<ActionButton text='Ir al inicio' className='w-full' variant='ghost' />
					</Link>
				</motion.div>
			</motion.div>
		</div>
	)
}
