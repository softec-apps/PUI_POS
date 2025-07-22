'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import { useRouter, useSearchParams } from 'next/navigation'
import { Icons } from '@/components/icons'
import { X } from 'lucide-react'

export function SignInForm() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [googleLoading, setGoogleLoading] = useState(false)
	const router = useRouter()
	const searchParams = useSearchParams()
	const callbackUrl = searchParams.get('callbackUrl') || ROUTE_PATH.ADMIN.DASHBOARD

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
			})

			if (result?.error) {
				setError('Credenciales inválidas.')
			} else if (result?.ok) {
				router.push(callbackUrl)
				router.refresh()
			}
		} catch (error) {
			setError('Ocurrió un error durante el login')
		} finally {
			setLoading(false)
		}
	}

	const handleGoogleSignIn = async () => {
		setGoogleLoading(true)
		setError('')

		try {
			await signIn('google', {
				callbackUrl: callbackUrl,
				redirect: true,
			})
		} catch (error) {
			console.error('Error en login con Google:', error)
			setError('Error al iniciar sesión con Google')
			setGoogleLoading(false)
		}
	}

	const togglePasswordVisibility = () => {
		setShowPassword(!showPassword)
	}

	// Animaciones
	const container = {
		hidden: { opacity: 0 },
		show: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.3,
			},
		},
	}

	const item = {
		hidden: { y: 20, opacity: 0 },
		show: {
			y: 0,
			opacity: 1,
			transition: {
				type: 'spring',
				damping: 15,
				stiffness: 200,
			},
		},
	}

	const errorItem = {
		hidden: { scale: 0.8, opacity: 0 },
		show: {
			scale: 1,
			opacity: 1,
			transition: {
				type: 'spring',
				stiffness: 500,
				damping: 25,
			},
		},
		exit: {
			scale: 0.8,
			opacity: 0,
			transition: {
				ease: 'easeIn',
				duration: 0.2,
			},
		},
	}

	return (
		<motion.div variants={container} initial='hidden' animate='show' className='space-y-6'>
			<motion.form variants={item} className='space-y-6' onSubmit={handleSubmit}>
				<motion.div variants={item} className='space-y-2'>
					<Label htmlFor='email'>Email</Label>
					<motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
						<Input
							id='email'
							name='email'
							type='email'
							autoComplete='email'
							required
							placeholder='tu@email.com'
							value={email}
							onChange={e => setEmail(e.target.value)}
							className='focus:ring-primary/50 transition-all focus:ring-2'
						/>
					</motion.div>
				</motion.div>

				<motion.div variants={item} className='space-y-2'>
					<div className='flex items-center justify-between'>
						<Label htmlFor='password'>Contraseña</Label>
						<motion.div whileHover={{ scale: 1.05 }}>
							<Link
								href='/forgot-password'
								className='text-muted-foreground hover:text-primary/80 text-sm underline-offset-4 transition-colors hover:underline'>
								¿Olvidaste tu contraseña?
							</Link>
						</motion.div>
					</div>
					<motion.div className='relative' whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
						<Input
							id='password'
							name='password'
							type={showPassword ? 'text' : 'password'}
							autoComplete='current-password'
							required
							placeholder='••••••••'
							value={password}
							onChange={e => setPassword(e.target.value)}
							className='focus:ring-primary/50 pr-10 transition-all focus:ring-2'
						/>
						<Button
							type='button'
							variant='link'
							size='sm'
							className='absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent'
							onClick={togglePasswordVisibility}>
							{showPassword ? (
								<Icons.eye className='text-muted-foreground h-4 w-4' />
							) : (
								<Icons.eyeClosed className='text-muted-foreground h-4 w-4' />
							)}
							<span className='sr-only'>{showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}</span>
						</Button>
					</motion.div>
				</motion.div>

				<AnimatePresence mode='wait'>
					{error && (
						<motion.div
							variants={errorItem}
							initial='hidden'
							animate='show'
							exit='exit'
							className='bg-destructive/15 text-destructive relative rounded-md p-3 pr-8 text-sm'>
							{error}
							<motion.button
								type='button'
								onClick={() => setError('')}
								className='absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded-sm p-1'
								whileHover={{
									scale: 1.2,
									rotate: 90,
									transition: { duration: 0.2 },
								}}
								whileTap={{
									scale: 0.8,
									rotate: 180,
								}}
								aria-label='Cerrar mensaje de error'>
								<X className='h-4 w-4' />
							</motion.button>
						</motion.div>
					)}
				</AnimatePresence>

				<motion.div variants={item}>
					<Button type='submit' className='w-full shadow-sm transition-shadow hover:shadow-md' disabled={loading}>
						{loading ? (
							<motion.div
								className='flex items-center gap-2'
								animate={{
									transition: { duration: 1, repeat: Infinity, ease: 'linear' },
								}}>
								<Icons.spinnerSimple className='h-4 w-4 animate-spin' />
								<span>Autenticando...</span>
							</motion.div>
						) : (
							<motion.span whileHover={{ scale: 1.05 }}>Continuar</motion.span>
						)}
					</Button>
				</motion.div>
			</motion.form>

			<motion.div variants={item} className='relative' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
				<div className='absolute inset-0 flex items-center'>
					<motion.span
						className='w-full border-t'
						initial={{ scaleX: 0 }}
						animate={{ scaleX: 1 }}
						transition={{ duration: 0.5, type: 'spring' }}
					/>
				</div>
				<div className='relative flex justify-center text-xs uppercase'>
					<motion.span
						className='bg-background text-muted-foreground px-2'
						initial={{ scale: 0.8 }}
						animate={{ scale: 1 }}>
						O continúa con
					</motion.span>
				</div>
			</motion.div>

			<motion.div variants={item}>
				<Button
					variant='outline'
					type='button'
					className='hover:bg-primary/5 flex w-full items-center justify-center gap-2'
					onClick={handleGoogleSignIn}
					disabled={googleLoading}>
					{googleLoading ? (
						<motion.div
							className='flex items-center gap-2'
							animate={{
								rotate: [0, 360],
								transition: { duration: 1, repeat: Infinity, ease: 'linear' },
							}}>
							<Icons.spinnerSimple className='h-4 w-4' />
							<span>Autenticando con Google...</span>
						</motion.div>
					) : (
						<>
							<motion.div
								animate={{
									rotate: [0, 360],
									transition: { duration: 10, repeat: Infinity, ease: 'linear' },
								}}>
								<Icons.google className='h-4 w-4' />
							</motion.div>
							<motion.span whileHover={{ scale: 1.05 }}>Google</motion.span>
						</>
					)}
				</Button>
			</motion.div>
		</motion.div>
	)
}
