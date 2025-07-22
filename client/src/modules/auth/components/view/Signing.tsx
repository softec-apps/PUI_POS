'use client'

import { motion, useMotionTemplate, useMotionValue, animate } from 'framer-motion'
import { SignInForm } from '@/modules/auth/components/organisms/Signing-form'
import { TermsConditions } from '@/modules/auth/components/organisms/TermsConditions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogoType } from '@/components/logos/LogoType'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { TypeAnimation } from 'react-type-animation'

export function SigningView() {
	const mouseX = useMotionValue(0)
	const mouseY = useMotionValue(0)
	const background = useMotionTemplate`radial-gradient(600px at ${mouseX}px ${mouseY}px, rgba(99, 102, 241, 0.15), transparent 80%)`
	const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0)

	const features = [
		'Gestión de inventario inteligente',
		'Analíticas en tiempo real',
		'Facturación electrónica integrada',
		'Plataforma 100% segura',
	]

	const solutions = [
		'Solución completa para tu negocio',
		'Herramientas poderosas para crecer',
		'Tecnología que impulsa tus ventas',
		'La mejor plataforma POS del mercado',
	]

	useEffect(() => {
		animate(0, 1, {
			duration: 0.8,
			onUpdate: latest => {
				document.body.style.opacity = latest.toString()
			},
		})

		// Rotar características cada 4 segundos
		const interval = setInterval(() => {
			setCurrentFeatureIndex(prev => (prev + 1) % solutions.length)
		}, 4000)
		return () => clearInterval(interval)
	}, [])

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.6 }}
			className='relative flex min-h-svh w-full overflow-hidden'
			onMouseMove={e => {
				mouseX.set(e.clientX)
				mouseY.set(e.clientY)
			}}>
			{/* Efecto de fondo dinámico */}
			<motion.div className='absolute inset-0 -z-10 opacity-60' style={{ background }} />

			{/* Columna izquierda */}
			<div className='flex w-full flex-col p-6 md:w-1/2 md:p-8'>
				{/* Logo con animación */}
				<motion.div
					initial={{ y: -20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{
						type: 'spring',
						stiffness: 400,
						damping: 20,
						delay: 0.2,
					}}
					className='mb-8'>
					<LogoType />
				</motion.div>

				{/* Contenido principal */}
				<div className='flex flex-1 flex-col'>
					<div className='flex flex-1 items-center justify-center'>
						<motion.div
							initial={{ scale: 0.98, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{
								delay: 0.4,
								type: 'spring',
								bounce: 0.4,
							}}
							className='w-full max-w-md'>
							<Card className='border-none bg-transparent p-0 shadow-none'>
								<CardHeader className='space-y-1'>
									<motion.div
										initial={{ x: -10, opacity: 0 }}
										animate={{ x: 0, opacity: 1 }}
										transition={{ delay: 0.6 }}>
										<CardTitle className='text-4xl font-bold'>Bienvenido de nuevo</CardTitle>
									</motion.div>
									<motion.div
										initial={{ x: -10, opacity: 0 }}
										animate={{ x: 0, opacity: 1 }}
										transition={{ delay: 0.7 }}>
										<CardDescription className='text-muted-foreground/90'>
											Ingresa tus credenciales para continuar
										</CardDescription>
									</motion.div>
								</CardHeader>

								<CardContent className='grid gap-4'>
									<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
										<SignInForm />
									</motion.div>

									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 1 }}
										className='mt-4 flex flex-col gap-2 space-y-2 text-center text-sm'>
										<span className='text-muted-foreground'>
											¿No tienes una cuenta?{' '}
											<Link
												href='/signup'
												className='text-primary hover:text-primary/80 font-medium underline underline-offset-4 transition-all duration-300 hover:underline-offset-2'>
												Crear cuenta
											</Link>
										</span>
									</motion.div>
								</CardContent>
							</Card>
						</motion.div>
					</div>

					{/* Términos con animación */}
					<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.1 }}>
						<TermsConditions />
					</motion.div>
				</div>
			</div>

			{/* Columna derecha - Efecto parallax */}
			<motion.div
				initial={{ opacity: 0, x: 100 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{
					delay: 0.4,
					type: 'spring',
					stiffness: 20,
				}}
				className='from-primary/5 to-muted/50 hidden w-1/2 flex-col justify-center bg-gradient-to-br p-12 md:flex'>
				<motion.div initial={{ y: 0, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
					<div className='mb-6'>
						<TypeAnimation
							sequence={[
								'Solución completa para tu negocio',
								2000,
								'Herramientas poderosas para crecer',
								2000,
								'Tecnología que impulsa tus ventas',
								2000,
								'La mejor plataforma POS del mercado',
								2000,
							]}
							wrapper='h2'
							speed={50}
							deletionSpeed={70}
							style={{
								fontSize: '1.875rem',
								fontWeight: 'bold',
								background: 'linear-gradient(to right, var(--foreground), var(--primary))',
								WebkitBackgroundClip: 'text',
								backgroundClip: 'text',
								color: 'transparent',
								display: 'inline-block',
							}}
							repeat={Infinity}
						/>
					</div>

					<ul className='space-y-4'>
						{features.map((feature, index) => (
							<motion.li
								key={index}
								initial={{ x: -20, opacity: 0 }}
								animate={{ x: 0, opacity: 1 }}
								transition={{ delay: 0.6 + index * 0.1 }}
								className='flex items-start gap-3'>
								<motion.div
									whileHover={{ scale: 1.1 }}
									className='bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full'>
									<Icons.check className='text-primary h-4 w-4 flex-shrink-0' />
								</motion.div>
								<span className='text-foreground/80'>{feature}</span>
							</motion.li>
						))}
					</ul>

					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ delay: 1 }}
						className='border-border/50 bg-background/70 mt-10 rounded-lg border p-6 backdrop-blur-xl'>
						<h3 className='mb-3 text-xl font-semibold'>¿Necesitas ayuda?</h3>
						<p className='text-muted-foreground mb-4'>Nuestro equipo está disponible para asistencia inmediata.</p>
						<Button variant='outline' className='hover:bg-primary/10 gap-2 transition-all hover:shadow-sm'>
							<Icons.mail className='h-4 w-4' />
							Contactar soporte
						</Button>
					</motion.div>
				</motion.div>
			</motion.div>
		</motion.div>
	)
}
