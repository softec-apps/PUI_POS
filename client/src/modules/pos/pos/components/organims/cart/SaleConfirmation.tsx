'use client'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Download, Sparkles, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Enhanced Confetti Component
const ConfettiPiece = ({ delay = 0, type = 'circle' }) => {
	const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#f97316', '#06b6d4', '#f43f5e']
	const randomColor = colors[Math.floor(Math.random() * colors.length)]
	const size = Math.random() * 6 + 2 // 2-8px

	const shapes = {
		circle: 'rounded-full',
		square: 'rounded-sm',
		star: 'rounded-full',
	}

	return (
		<motion.div
			className={`absolute ${shapes[type]}`}
			style={{
				backgroundColor: randomColor,
				width: size,
				height: size,
			}}
			initial={{
				y: -100,
				x: Math.random() * window.innerWidth,
				rotate: 0,
				opacity: 1,
			}}
			animate={{
				y: window.innerHeight + 100,
				x: Math.random() * window.innerWidth,
				rotate: Math.random() * 1080,
				opacity: 0,
			}}
			transition={{
				duration: 4 + Math.random() * 3,
				delay: delay,
				ease: 'easeOut',
			}}
		/>
	)
}

const Confetti = ({ isActive }) => {
	const [pieces, setPieces] = useState([])

	useEffect(() => {
		if (isActive) {
			// Crear múltiples oleadas de confeti
			const createWave = (waveDelay = 0) => {
				setTimeout(() => {
					const newPieces = Array.from({ length: 80 }, (_, i) => ({
						id: `${Date.now()}-${i}`,
						type: ['circle', 'square', 'star'][Math.floor(Math.random() * 3)],
						delay: Math.random() * 0.8,
					}))
					setPieces(prev => [...prev, ...newPieces])
				}, waveDelay)
			}

			// 3 oleadas de confeti
			createWave(0)
			createWave(500)
			createWave(1000)

			// Limpiar después de 5 segundos
			setTimeout(() => setPieces([]), 5000)
		}
	}, [isActive])

	if (!isActive || pieces.length === 0) return null

	return (
		<div className='pointer-events-none fixed inset-0 z-60 overflow-hidden'>
			{pieces.map(piece => (
				<ConfettiPiece key={piece.id} delay={piece.delay} type={piece.type} />
			))}
		</div>
	)
}

// Floating Elements
const FloatingElement = ({ children, delay = 0, className = '' }) => (
	<motion.div
		initial={{ opacity: 0, scale: 0, rotate: -180 }}
		animate={{
			opacity: [0, 1, 1, 0],
			scale: [0, 1.2, 1, 0.8],
			rotate: [0, 360, 720],
		}}
		transition={{
			duration: 2.5,
			delay,
			times: [0, 0.2, 0.8, 1],
			ease: 'easeOut',
		}}
		className={`absolute ${className}`}>
		{children}
	</motion.div>
)

// Main Component
interface BillingInfo {
	attempted: boolean
	success: boolean
	status: string
}

interface SaleItem {
	id: string
	saleId: string
	productName: string
	quantity: number
	unitPrice: number
	totalPrice: number
}

interface PaymentMethod {
	amount: number
	method: string
	transferNumber?: string
}

interface Customer {
	id: string
	name: string
	email?: string
	phone?: string
}

interface SaleResponseData {
	id: string
	subtotal: number
	taxRate: number
	taxAmount: number
	total: number
	totalItems: number
	billing?: BillingInfo
	clave_acceso: string | null
	createdAt: string
	customer: Customer
	customerId: string | null
	estado_sri: string
	items: SaleItem[]
	paymentMethods: PaymentMethod[]
	receivedAmount: number
	change: number
}

interface SaleResponse {
	success: boolean
	statusCode: number
	message: string
	data: SaleResponseData
	meta: {
		timestamp: string
		resource: string
		method: string
	}
}

interface SaleConfirmationProps {
	saleData: SaleResponse | null
	onClose: () => void
	isOpen: boolean
}

export function SaleConfirmation({ saleData, onClose, isOpen }: SaleConfirmationProps) {
	const [showConfetti, setShowConfetti] = useState(false)

	useEffect(() => {
		if (isOpen && saleData) {
			// Activar confeti inmediatamente
			setShowConfetti(true)
			// Desactivar confeti después de 5 segundos
			setTimeout(() => setShowConfetti(false), 5000)
		}
	}, [isOpen, saleData])

	if (!saleData) return null

	const handleDownload = () => {
		console.log('Descargar comprobante')
	}

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('es-EC', {
			style: 'currency',
			currency: 'USD',
		}).format(amount)
	}

	return (
		<>
			<Confetti isActive={showConfetti} />
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className='overflow-hidden border-2 border-green-200/50 shadow-2xl sm:max-w-md'>
					{/* Floating celebration elements */}
					<div className='pointer-events-none absolute inset-0'>
						<FloatingElement delay={0.3} className='-top-4 -left-4'>
							<Sparkles className='h-6 w-6 text-yellow-500' />
						</FloatingElement>
						<FloatingElement delay={0.5} className='-top-2 -right-4'>
							<PartyPopper className='h-5 w-5 text-purple-500' />
						</FloatingElement>
						<FloatingElement delay={0.7} className='bottom-4 -left-2'>
							<Sparkles className='h-4 w-4 text-blue-500' />
						</FloatingElement>
					</div>

					<DialogHeader className='relative -mx-6 -mt-6 overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 px-6 pt-8 pb-6 text-center'>
						{/* Background decoration */}
						<motion.div
							animate={{ rotate: 360 }}
							transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
							className='absolute -top-4 -right-4 h-12 w-12 rounded-full bg-green-100/30'
						/>
						<motion.div
							animate={{ rotate: -360 }}
							transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
							className='absolute -bottom-2 -left-2 h-8 w-8 rounded-full bg-emerald-100/40'
						/>

						{/* Success icon with enhanced animation */}
						<motion.div
							initial={{ scale: 0, rotate: -180 }}
							animate={{ scale: 1, rotate: 0 }}
							transition={{
								type: 'spring',
								delay: 0.3,
								duration: 0.8,
								bounce: 0.6,
							}}
							className='relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 border-green-100 bg-white shadow-lg'>
							<CheckCircle className='h-10 w-10 text-green-600' />
							{/* Pulse rings */}
							<motion.div
								animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
								transition={{ duration: 2, repeat: Infinity }}
								className='absolute inset-0 rounded-full bg-green-200'
							/>
							<motion.div
								animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
								transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
								className='absolute inset-0 rounded-full bg-green-300'
							/>
						</motion.div>

						{/* Animated text */}
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
							<DialogTitle asChild>
								<motion.h2
									className='mb-4 text-2xl font-bold text-green-800'
									animate={{ scale: [1, 1.05, 1] }}
									transition={{ duration: 2, repeat: Infinity }}>
									¡Venta Exitosa! 🎉
								</motion.h2>
							</DialogTitle>
							<div className='space-y-2'>
								<p className='text-muted-foreground text-sm'>Venta #{saleData.data.id.substring(0, 8).toUpperCase()}</p>
								<motion.div
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.7, type: 'spring', bounce: 0.5 }}
									className='inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700'>
									{formatCurrency(saleData.data.total)}
								</motion.div>
							</div>
						</motion.div>
					</DialogHeader>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.8 }}
						className='flex gap-3 pt-4'>
						<Button variant='outline' className='flex-1 hover:bg-gray-50' onClick={onClose}>
							Cerrar
						</Button>
						<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className='flex-1'>
							<Button className='w-full bg-green-600 shadow-lg hover:bg-green-700' onClick={handleDownload}>
								<Download className='mr-2 h-4 w-4' />
								Descargar
							</Button>
						</motion.div>
					</motion.div>
				</DialogContent>
			</Dialog>
		</>
	)
}
