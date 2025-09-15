'use client'

import api from '@/lib/axios'
import { motion } from 'framer-motion'
import { Icons } from '@/components/icons'
import { Input } from '@/components/ui/input'
import React, { useState, useEffect } from 'react'
import { Typography } from '@/components/ui/typography'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { ImageControl } from '@/components/layout/organims/ImageControl'
import { toast } from 'sonner'

interface CartItemProps {
	item: {
		id: string
		name: string
		price: number
		quantity: number
		image?: string
		code?: string
		taxRate: number
		discount?: number
	}
	index: number
	onUpdateQuantity: (id: string, change: number) => void
	onUpdateDiscount: (id: string, discount: number) => void
	onRemoveItem: (id: string) => void
}

// ✅ Interfaz corregida basada en la respuesta real de la API
interface ProductStockResponse {
	hasEnoughStock: boolean
	currentStock: number
	message?: string
}

export const CartItem: React.FC<CartItemProps> = ({
	item,
	index,
	onUpdateQuantity,
	onUpdateDiscount,
	onRemoveItem,
}) => {
	const [inputQuantity, setInputQuantity] = useState(item.quantity.toString())
	const [inputDiscount, setInputDiscount] = useState((item.discount || 0).toString())
	const [isEditingQuantity, setIsEditingQuantity] = useState(false)
	const [isEditingDiscount, setIsEditingDiscount] = useState(false)
	const [isValidatingStock, setIsValidatingStock] = useState(false)
	const [stockError, setStockError] = useState<string>('')
	const [availableStock, setAvailableStock] = useState<number | null>(null)

	// Sync inputs with actual values when item changes
	useEffect(() => setInputQuantity(item.quantity.toString()), [item.quantity])

	useEffect(() => setInputDiscount((item.discount || 0).toString()), [item.discount])

	// ✅ Función para verificar stock - corregida para enviar quantity como query parameter
	const checkStock = async (productId: string, requestedQuantity: number): Promise<boolean> => {
		try {
			setIsValidatingStock(true)
			setStockError('')

			// Enviar la cantidad absoluta que el usuario quiere como query parameter
			const response = await api.get<ProductStockResponse>(`/product/check/${productId}?quantity=${requestedQuantity}`)
			const { hasEnoughStock, currentStock, message } = response.data

			setAvailableStock(currentStock)

			if (!hasEnoughStock) {
				const errorMessage = message || `Unidades disponibles ${currentStock}`
				setStockError(errorMessage)
				return false
			}

			// No mostrar toast de éxito para validaciones exitosas
			return true
		} catch (error: any) {
			console.error('Error al verificar stock:', error)
			const errorMessage = error.response?.data?.message || 'Error al verificar disponibilidad'
			setStockError(errorMessage)
			return false
		} finally {
			setIsValidatingStock(false)
		}
	}

	// Calculate prices with discount
	const originalPrice = item.price * item.quantity
	const discountAmount = originalPrice * ((item.discount || 0) / 100)
	const discountedPrice = originalPrice - discountAmount
	const unitDiscountedPrice = item.price * (1 - (item.discount || 0) / 100)

	// Handle quantity input change
	const handleQuantityInputChange = (value: string) => {
		const numericValue = value.replace(/[^0-9]/g, '')
		setInputQuantity(numericValue)
		// Limpiar error cuando el usuario empiece a editar
		if (stockError) {
			setStockError('')
		}
	}

	// Handle discount input change
	const handleDiscountInputChange = (value: string) => {
		// Allow numbers and decimal point
		const numericValue = value.replace(/[^0-9.]/g, '')
		// Prevent multiple decimal points
		const parts = numericValue.split('.')
		if (parts.length > 2) {
			return
		}
		setInputDiscount(numericValue)
	}

	// Handle quantity input blur with stock validation
	const handleQuantityInputBlur = async () => {
		// Si el campo está vacío, establecerlo en 1 (valor mínimo)
		if (inputQuantity === '' || parseInt(inputQuantity) === 0) {
			setInputQuantity('1')
			setIsEditingQuantity(false)
			return
		}

		const newQuantity = parseInt(inputQuantity)
		const clampedQuantity = Math.max(1, newQuantity)

		// Si la cantidad no cambió, no hacer nada
		if (clampedQuantity === item.quantity) {
			setInputQuantity(clampedQuantity.toString())
			setIsEditingQuantity(false)
			return
		}

		// Verificar stock antes de actualizar
		const isStockValid = await checkStock(item.id, clampedQuantity)

		if (isStockValid) {
			const change = clampedQuantity - item.quantity
			onUpdateQuantity(item.id, change)
			setInputQuantity(clampedQuantity.toString())
		} else {
			// Establecer el campo en vacío cuando hay error de validación
			setInputQuantity('')
		}

		setIsEditingQuantity(false)
	}

	// Handle discount input blur
	const handleDiscountInputBlur = () => {
		const newDiscount = parseFloat(inputDiscount) || 0
		const clampedDiscount = Math.max(0, Math.min(100, newDiscount))

		if (clampedDiscount !== (item.discount || 0)) {
			onUpdateDiscount(item.id, clampedDiscount)
		}

		setInputDiscount(clampedDiscount.toString())
		setIsEditingDiscount(false)
	}

	// Handle key press for inputs
	const handleQuantityKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleQuantityInputBlur()
		}
		if (e.key === 'Escape') {
			setInputQuantity(item.quantity.toString())
			setIsEditingQuantity(false)
			setStockError('')
		}
	}

	const handleDiscountKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleDiscountInputBlur()
		}
		if (e.key === 'Escape') {
			setInputDiscount((item.discount || 0).toString())
			setIsEditingDiscount(false)
		}
	}

	// Handle increment/decrement buttons with stock validation
	const handleIncrement = async () => {
		const newQuantity = item.quantity + 1
		const isStockValid = await checkStock(item.id, newQuantity)

		if (isStockValid) {
			onUpdateQuantity(item.id, 1)
		} else {
			// Establecer el campo en vacío cuando hay error de validación
			setInputQuantity('')
		}
	}

	const handleDecrement = () => {
		if (item.quantity > 1) {
			onUpdateQuantity(item.id, -1)
			// Limpiar error si existe al decrementar
			if (stockError) {
				setStockError('')
			}
		}
	}

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 },
		exit: { opacity: 0, x: -100 },
	}

	return (
		<motion.div
			variants={itemVariants}
			initial='hidden'
			animate='visible'
			exit='exit'
			layout
			transition={{ duration: 0.2, delay: index * 0.05 }}
			className='flex w-full min-w-full py-2'>
			<div className='flex w-full items-start gap-2'>
				{/* Imagen más compacta */}
				<ImageControl imageUrl={item?.image} enableHover={false} enableClick={false} imageHeight={52} imageWidth={52} />

				{/* Contenido principal - estructura compacta */}
				<div className='flex flex-1 flex-col'>
					{/* Fila 1: Nombre y botón eliminar */}
					<div className='flex items-start justify-between gap-2'>
						<Typography variant='small' className='text-primary line-clamp-1 flex-1 text-xs font-medium'>
							{item.name}
						</Typography>
						<ActionButton
							variant='ghost'
							size='icon'
							tooltip='Remover'
							className='!text-destructive hover:!bg-destructive/20 h-6 w-6'
							onClick={() => onRemoveItem(item.id)}
							icon={<Icons.trash className='h-6 w-6' />}
						/>
					</div>

					{/* Fila 2: Controles y precios */}
					<div className='flex items-center justify-between gap-2'>
						<div className='flex items-center gap-4'>
							{/* Controles de cantidad */}
							<div className='flex items-center gap-1'>
								<Typography variant='small' className='text-muted-foreground text-[11px]'>
									Cnt:
								</Typography>
								<div className='relative'>
									<Input
										value={inputQuantity}
										onChange={e => handleQuantityInputChange(e.target.value)}
										onFocus={() => setIsEditingQuantity(true)}
										onBlur={handleQuantityInputBlur}
										onKeyDown={handleQuantityKeyPress}
										className={`h-6 w-14 rounded-md text-center !text-xs ${
											isEditingQuantity ? 'ring-primary border-primary ring-1' : ''
										} ${stockError ? 'border-destructive ring-destructive ring-1' : ''}`}
										min='1'
										disabled={isValidatingStock}
										placeholder='1'
									/>
									{isValidatingStock && (
										<div className='bg-background/80 absolute inset-0 flex items-center justify-center'>
											<Icons.spinnerSimple className='h-3 w-3 animate-spin' />
										</div>
									)}
								</div>
							</div>

							{/* Controles de descuento */}
							<div className='flex items-center gap-1'>
								<Typography variant='small' className='text-muted-foreground text-[11px]'>
									Desc:
								</Typography>
								<div>
									<Input
										value={inputDiscount}
										onChange={e => handleDiscountInputChange(e.target.value)}
										onFocus={() => setIsEditingDiscount(true)}
										onBlur={handleDiscountInputBlur}
										onKeyDown={handleDiscountKeyPress}
										className={`h-6 w-14 rounded-md text-center !text-xs ${isEditingDiscount ? 'ring-primary border-primary ring-1' : ''}`}
										min='0'
										max='100'
										step='0.1'
									/>
								</div>
								<Typography variant='small' className='text-muted-foreground text-xs'>
									%
								</Typography>
							</div>
						</div>

						{/* Precios */}
						<div className='flex items-center gap-0.5'>
							<Typography variant='small' className='text-primary font-mono text-xs'>
								${formatPrice(discountedPrice)}
							</Typography>
							{(item.discount || 0) > 0 && (
								<Typography variant='small' className='text-muted-foreground/80 font-mono text-xs line-through'>
									${formatPrice(originalPrice)}
								</Typography>
							)}
						</div>
					</div>

					{/* Mostrar error de stock si existe */}
					{stockError && (
						<div className='mt-1'>
							<Typography variant='small' className='text-destructive text-xs'>
								{stockError}
							</Typography>
						</div>
					)}
				</div>
			</div>
		</motion.div>
	)
}
