'use client'

import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import React, { useState, useEffect, useRef } from 'react'

import { useProduct } from '@/common/hooks/useProduct'
import { useCategory } from '@/common/hooks/useCategory'
import { useDebounce } from '@/common/hooks/useDebounce'

import { EmptyState } from '@/components/layout/organims/EmptyState'

import { useCartStore } from '@/common/stores/useCartStore'

import { Icons } from '@/components/icons'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { CartSidebar } from '@/modules/pos/matriz/components/organims/CartSidebar'
import { ProductCard, ProductCardSkeleton } from '@/modules/pos/matriz/components/organims/ProductCard'
import { CategoryCard, CategoryCardSkeleton } from '@/modules/pos/matriz/components/organims/CategoryCard'
import { useSale } from '@/common/hooks/useSale'
import { Typography } from '@/components/ui/typography'
import { toast } from 'sonner'
import { NavbarPOSMatriz } from '@/modules/pos/pos/components/template/PosNavbar'

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.05,
		},
	},
}

const sectionVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
}

// Types para los datos de la venta
interface SaleData {
	customerId: string
	customer: {
		id: string
		firstName: string
		lastName: string
		identificationType: string
		identificationNumber: string
		email?: string
		phone?: string
		address?: string
	}
	items: {
		productId: string
		productName: string
		image: string
		productCode?: string
		quantity: number
		unitPrice: number
		totalPrice: number
	}[]
	financials: {
		subtotal: number
		tax: number
		taxRate: number
		total: number
		totalItems: number
	}
	payment: {
		method: 'cash' | 'digital' | 'card'
		receivedAmount: number
		change: number
		transferNumber?: string
	}
	metadata: {
		saleDate: string
	}
}

export function MatrizView() {
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedProductIndex, setSelectedProductIndex] = useState(-1)

	const debouncedSearchTerm = useDebounce(searchTerm, 300)
	const searchInputRef = useRef<HTMLInputElement>(null)

	const [page, setPage] = useState(1)

	// Cart store
	const { addItem } = useCartStore()

	const { recordsData: categoryData, loading: loadingCategories } = useCategory({ limit: 23 })

	// Solo cargar productos cuando hay una categoría seleccionada o hay búsqueda
	const {
		recordsData: productResponse,
		loading: productLoading,
		refetchRecords: refetchProducts,
	} = useProduct({
		search: debouncedSearchTerm,
		filters: selectedCategory && selectedCategory !== 'all' ? { categoryId: selectedCategory } : undefined,
		page,
		limit: 24,
	})

	useEffect(() => {
		if (selectedCategory || debouncedSearchTerm.length > 0) refetchProducts()
		setSelectedProductIndex(-1)
	}, [debouncedSearchTerm, page, selectedCategory])

	const allProducts = productResponse?.data?.items || []
	const categories = [
		{
			id: 'all',
			name: 'Todos',
			photo: null,
		},
		...(categoryData?.data?.items || []),
	]

	// Encontrar la categoría seleccionada para mostrar su nombre
	const currentCategory = categories.find(cat => cat.id === selectedCategory)

	// Función para añadir al carrito
	const handleAddToCart = product => {
		addItem({
			id: product.id,
			name: product.name,
			price: product.pricePublic,
			image: product?.photo?.path,
			code: product.code,
			taxRate: product.tax,
		})

		toast.info('Producto añadido para venta')

		// Limpiar búsqueda después de añadir si hay coincidencia exacta
		if (allProducts.length === 1 && debouncedSearchTerm.length > 0) {
			setSearchTerm('')
			searchInputRef.current?.focus()
		}
	}

	// Auto-seleccionar y añadir primer producto cuando hay resultados
	useEffect(() => {
		if (allProducts.length === 1 && debouncedSearchTerm.length > 0) {
			setSelectedProductIndex(0)
			// Auto-añadir al carrito cuando hay solo un producto
			handleAddToCart(allProducts[0])
		} else if (allProducts.length > 1 && debouncedSearchTerm.length > 0) {
			setSelectedProductIndex(0)
		} else {
			setSelectedProductIndex(-1)
		}
	}, [allProducts.length, debouncedSearchTerm])

	const { createRecord: createSale } = useSale()

	const handlePlaceOrder = async (saleData: SaleData) => {
		try {
			console.log('🛒 Datos originales del frontend:', saleData)

			// Solo enviar los datos esenciales - el backend calculará todo lo demás
			const formattedData = {
				customerId: saleData.customerId,
				paymentMethod: saleData.payment.method,
				// Solo incluir receivedAmount si es pago en efectivo
				...(saleData.payment.method === 'cash' && {
					receivedAmount: saleData.payment.receivedAmount,
				}),
				// Solo enviar productId y quantity - el backend buscará el resto
				items: saleData.items.map(item => ({
					productId: item.productId,
					quantity: item.quantity,
				})),
			}

			console.log('📤 DATA TO BACKEND (simplificado):', formattedData)
			console.log(
				'🔍 Items enviados:',
				formattedData.items.map(item => `${item.productId} x${item.quantity}`)
			)

			// El backend retornará los totales calculados para verificación
			const response = await createSale(formattedData)

			console.log('✅ Respuesta del backend:', response)

			// Opcional: Comparar totales calculados por el backend vs frontend
			if (response.data?.calculatedTotals) {
				const backendTotals = response.data.calculatedTotals
				const frontendTotals = saleData.financials

				console.log('📊 Comparación de totales:')
				console.log('Frontend:', {
					subtotal: frontendTotals.subtotal,
					tax: frontendTotals.tax,
					total: frontendTotals.total,
					items: frontendTotals.totalItems,
				})
				console.log('Backend:', {
					subtotal: backendTotals.subtotal,
					tax: backendTotals.taxAmount,
					total: backendTotals.total,
					items: backendTotals.totalItems,
				})

				// Alertar si hay diferencias significativas (más de 1 centavo)
				const tolerance = 0.01
				if (Math.abs(frontendTotals.total - backendTotals.total) > tolerance) {
					console.warn('⚠️ DIFERENCIA EN TOTALES:', {
						frontend: frontendTotals.total,
						backend: backendTotals.total,
						diferencia: Math.abs(frontendTotals.total - backendTotals.total),
					})

					// Opcional: mostrar notificación al usuario sobre la diferencia
					// toast.warning(`Total recalculado: $${backendTotals.total} (era $${frontendTotals.total})`)
				}
			}

			return response
		} catch (error) {
			console.error('❌ Error al procesar la venta:', error)

			// Mejorar el manejo de errores específicos
			if (error.response?.data?.message) {
				console.error('💬 Mensaje del servidor:', error.response.data.message)
			}

			if (error.response?.status === 409) {
				console.error('🚫 Conflicto (probablemente stock insuficiente)')
			} else if (error.response?.status === 404) {
				console.error('🔍 No encontrado (producto o cliente inexistente)')
			} else if (error.response?.status === 400) {
				console.error('📝 Datos inválidos')
			}

			throw error
		}
	}

	// Función para manejar la selección de categoría
	const handleCategorySelect = (categoryId: string) => {
		setSelectedCategory(categoryId)
		setSearchTerm('') // Limpiar búsqueda al seleccionar categoría
		setPage(1) // Reset página
	}

	// Función para regresar a las categorías
	const handleBackToCategories = () => {
		setSelectedCategory(null)
		setSearchTerm('')
		setPage(1)
	}

	return (
		<div className='flex h-[calc(100vh-0.5rem)] min-h-[calc(100vh-0.5rem)] w-full gap-4'>
			<div className='flex flex-1 flex-col space-y-4'>
				<NavbarPOSMatriz />

				<div className='flex flex-shrink-0 items-center justify-between px-2 pr-4'>
					<motion.div
						key={selectedCategory ? 'category-selected' : 'categories'}
						variants={sectionVariants}
						initial='hidden'
						animate='visible'
						exit='hidden'
						className='flex items-center gap-4'>
						{!selectedCategory ? (
							<Typography variant='lead' className='uppercase'>
								Categorías
							</Typography>
						) : (
							<>
								<ActionButton
									onClick={handleBackToCategories}
									icon={<Icons.iconArrowLeft className='h-4 w-4' />}
									variant='secondary'
									size='lg'
								/>
								<Typography variant='lead' className='uppercase'>
									{currentCategory?.name}
								</Typography>
							</>
						)}
					</motion.div>

					{/* Barra de búsqueda */}
					<div className='relative'>
						<Icons.search className='text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform' />
						<Input
							ref={searchInputRef}
							placeholder='Buscar por nombre o códigos...'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className={`bg-card focus:border-primary h-10 rounded-2xl border-2 pr-12 pl-12 ${
								searchTerm && allProducts.length === 1 ? 'border-green-500 focus:border-green-500' : ''
							}`}
						/>
						{searchTerm && (
							<div className='absolute top-1/2 right-2 flex -translate-y-1/2 gap-1'>
								<ActionButton
									onClick={() => setSearchTerm('')}
									icon={<Icons.x />}
									variant='secondary'
									size='sm'
									className='text-muted-foreground hover:text-foreground rounded-full'
								/>
							</div>
						)}
					</div>
				</div>

				<ScrollArea className='flex-1 overflow-auto pr-2 pb-6'>
					<div className='m-1 space-y-6'>
						{/* Mostrar productos si hay búsqueda o categoría seleccionada */}
						{(debouncedSearchTerm.length > 0 || selectedCategory) && (
							<motion.div variants={sectionVariants} initial='hidden' animate='visible' className='space-y-4'>
								{/* Grid de productos */}
								{productLoading ? (
									<motion.div
										variants={containerVariants}
										initial='hidden'
										animate='visible'
										className='grid grid-cols-2 gap-4 px-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
										<ProductCardSkeleton count={24} />
									</motion.div>
								) : allProducts.length === 0 ? (
									<EmptyState />
								) : (
									<motion.div
										variants={containerVariants}
										initial='hidden'
										animate='visible'
										className='grid grid-cols-2 gap-4 px-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
										{allProducts.map((product, index) => (
											<ProductCard
												key={product.id}
												product={product}
												onAddToCart={handleAddToCart}
												isSelected={selectedProductIndex === index}
												onSelect={() => setSelectedProductIndex(index)}
											/>
										))}
									</motion.div>
								)}
							</motion.div>
						)}

						{/* Mostrar categorías solo cuando no hay búsqueda ni categoría seleccionada */}
						{!debouncedSearchTerm.length && !selectedCategory && (
							<motion.div variants={sectionVariants} initial='hidden' animate='visible' className='space-y-4 px-2'>
								{loadingCategories ? (
									<motion.div
										variants={containerVariants}
										initial='hidden'
										animate='visible'
										className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
										<CategoryCardSkeleton count={24} />
									</motion.div>
								) : (
									<motion.div
										variants={containerVariants}
										initial='hidden'
										animate='visible'
										className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
										{categories.map(category => (
											<CategoryCard
												key={category.id}
												category={category}
												isSelected={false}
												onSelect={() => handleCategorySelect(category.id)}
											/>
										))}
									</motion.div>
								)}
							</motion.div>
						)}
					</div>
				</ScrollArea>
			</div>

			{/* Sidebar del carrito */}
			<CartSidebar onPlaceOrder={handlePlaceOrder} />
		</div>
	)
}
