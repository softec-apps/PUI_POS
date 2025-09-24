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
import { FooterPublic } from '@/components/layout/templates/FooterPublic'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import api from '@/lib/axios'
import { toast } from 'sonner'

// Tipos para la respuesta del stock
interface ProductStockResponse {
	hasEnoughStock: boolean
	currentStock: number
	message?: string
}

// Tipos para la respuesta de venta con PDF
interface SaleResponse {
	data: {
		id: string
		// ... otros campos de la venta
		pdfVoucher?: string // PDF en base64
		// ... otros campos
	}
}

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

// Función para descargar PDF desde base64
const downloadPDFFromBase64 = (base64String: string, filename: string = 'comprobante.pdf') => {
	try {
		// Crear un blob desde base64
		const byteCharacters = atob(base64String)
		const byteNumbers = new Array(byteCharacters.length)

		for (let i = 0; i < byteCharacters.length; i++) {
			byteNumbers[i] = byteCharacters.charCodeAt(i)
		}

		const byteArray = new Uint8Array(byteNumbers)
		const blob = new Blob([byteArray], { type: 'application/pdf' })

		// Crear URL y descargar
		const url = window.URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = filename
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		window.URL.revokeObjectURL(url)
	} catch (error) {
		console.error('Error al descargar PDF:', error)
		toast.error('Error', {
			description: 'No se pudo descargar el comprobante',
		})
	}
}

// Función para abrir PDF en nueva pestaña
const openPDFInNewTab = (base64String: string) => {
	try {
		const byteCharacters = atob(base64String)
		const byteNumbers = new Array(byteCharacters.length)

		for (let i = 0; i < byteCharacters.length; i++) {
			byteNumbers[i] = byteCharacters.charCodeAt(i)
		}

		const byteArray = new Uint8Array(byteNumbers)
		const blob = new Blob([byteArray], { type: 'application/pdf' })
		const url = window.URL.createObjectURL(blob)
		window.open(url, '_blank')

		// Limpiar después de un tiempo
		setTimeout(() => window.URL.revokeObjectURL(url), 1000)
	} catch (error) {
		console.error('Error al abrir PDF:', error)
		toast.error('Error', {
			description: 'No se pudo abrir el comprobante',
		})
	}
}

// Componente de Loading Inicial
const InitialLoadingSpinner = () => (
	<div className='flex h-screen w-full items-center justify-center'>
		<div className='flex flex-col items-center space-y-6'>
			<SpinnerLoader text='Cargando... Por favor espera' />
		</div>
	</div>
)

// Types para múltiples pagos y descuentos
interface PaymentEntry {
	id: string
	method: string
	amount: number
	transferNumber?: string
	timestamp: number
}

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
		discount: number
		discountAmount: number
	}[]
	financials: {
		subtotal: number
		tax: number
		total: number
		totalItems: number
		totalDiscountAmount: number
	}
	payments: PaymentEntry[]
	metadata: {
		saleDate: string
	}
}

export function MatrizView() {
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedProductIndex, setSelectedProductIndex] = useState(-1)
	const [isInitialLoading, setIsInitialLoading] = useState(true)

	// Estados para validación de stock
	const [isValidatingStock, setIsValidatingStock] = useState(false)
	const [stockError, setStockError] = useState('')
	const [availableStock, setAvailableStock] = useState<number>(0)

	const debouncedSearchTerm = useDebounce(searchTerm, 300)
	const searchInputRef = useRef<HTMLInputElement>(null)

	const [page, setPage] = useState(1)

	// Usar orderItems en lugar de items
	const { addItem, orderItems } = useCartStore()

	const { recordsData: categoryData, loading: loadingCategories } = useCategory({ limit: 41 })

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

	// Función para verificar stock
	const checkStock = async (productId: string, requestedQuantity: number): Promise<boolean> => {
		try {
			setIsValidatingStock(true)
			setStockError('')

			const response = await api.get<ProductStockResponse>(`/product/check/${productId}?quantity=${requestedQuantity}`)
			const { hasEnoughStock, currentStock, message } = response.data

			setAvailableStock(currentStock)

			if (!hasEnoughStock) {
				const errorMessage = message || `Solo hay ${currentStock} unidades disponibles`
				setStockError(errorMessage)

				toast.error('Stock insuficiente', {
					description: `Solo quedan ${currentStock} unidades disponibles.`,
				})

				return false
			}

			return true
		} catch (error: any) {
			console.error('Error al verificar stock:', error)
			const errorMessage = error.response?.data?.message || 'Error al verificar disponibilidad'
			setStockError(errorMessage)

			toast.error('Error del sistema', {
				description: 'No se pudo verificar el stock disponible. Inténtalo de nuevo.',
				duration: 3000,
			})

			return false
		} finally {
			setIsValidatingStock(false)
		}
	}

	// Controlar el loading inicial
	useEffect(() => {
		if (!loadingCategories && categoryData) {
			const timer = setTimeout(() => setIsInitialLoading(false), 300)
			return () => clearTimeout(timer)
		}
	}, [loadingCategories, categoryData])

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

	// Función para verificar si el producto está activo
	const isProductActive = (product: any): boolean => {
		return product.status === 'active'
	}

	// Función para obtener el mensaje de error según el status
	const getStatusErrorMessage = (product: any): string => {
		switch (product.status) {
			case 'draft':
				return 'Producto en borrador'
			case 'inactive':
				return 'Producto inactivo'
			case 'discontinued':
				return 'Producto descontinuado'
			case 'out_of_stock':
				return 'Producto sin stock'
			default:
				return 'Producto no disponible'
		}
	}

	// Función handleAddToCart con validación de status y stock
	const handleAddToCart = async (product: any) => {
		try {
			// Primero verificar si el producto está activo
			if (!isProductActive(product)) {
				const errorMessage = getStatusErrorMessage(product)
				toast.error('Producto no disponible', {
					description: errorMessage,
				})
				return
			}

			const existingItem = orderItems?.find(item => item.id === product.id)
			const currentQuantityInCart = existingItem ? existingItem.quantity : 0
			const newTotalQuantity = currentQuantityInCart + 1

			const hasStock = await checkStock(product.id, newTotalQuantity)

			if (!hasStock) return

			addItem({
				id: product.id,
				name: product.name,
				price: product.pricePublic,
				image: product?.photo?.path,
				code: product.code,
				taxRate: product.tax,
				discount: 0,
			})

			if (allProducts.length === 1 && debouncedSearchTerm.length > 0) {
				setSearchTerm('')
				searchInputRef.current?.focus()
			}

			toast.success('Producto añadido', {
				description: `Se añadió ${newTotalQuantity} ${newTotalQuantity === 1 ? 'unidad' : 'unidades'} de ${product.name}`,
			})
		} catch (error) {
			console.error('Error al añadir producto al carrito:', error)
			toast.error('Error', {
				description: 'No se pudo añadir el producto al carrito. Inténtalo de nuevo.',
			})
		}
	}

	// Auto-seleccionar y añadir primer producto cuando hay resultados (solo si está activo)
	useEffect(() => {
		if (allProducts.length === 1 && debouncedSearchTerm.length > 0) {
			const product = allProducts[0]
			if (isProductActive(product)) {
				setSelectedProductIndex(0)
				handleAddToCart(product)
			}
		} else if (allProducts.length > 1 && debouncedSearchTerm.length > 0) {
			setSelectedProductIndex(0)
		} else {
			setSelectedProductIndex(-1)
		}
	}, [allProducts.length, debouncedSearchTerm])

	const { createSriSale, createSimpleSale } = useSale()

	// Función para manejar la selección de categoría
	const handleCategorySelect = (categoryId: string) => {
		setSelectedCategory(categoryId)
		setSearchTerm('')
		setPage(1)
	}

	// Función para regresar a las categorías
	const handleBackToCategories = () => {
		setSelectedCategory(null)
		setSearchTerm('')
		setPage(1)
	}

	const handleSriSale = async (saleData: SaleData) => {
		try {
			// Formatear datos para backend
			const formattedData = {
				customerId: saleData.customerId,
				payments: saleData.payments.map(p => ({
					method: p.method,
					amount: p.amount,
					...(p.transferNumber && { transferNumber: p.transferNumber }),
				})),
				items: saleData.items.map(i => ({
					productId: i.productId,
					quantity: i.quantity,
					discountPercentage: i.discount,
					discountAmount: i.discountAmount,
				})),
			}

			// Llamada al backend
			const response = await createSriSale(formattedData)

			// Manejar el PDF desde la respuesta del backend
			if (response.data.pdfVoucher) openPDFInNewTab(response.data.pdfVoucher)

			return response
		} catch (error) {
			throw error
		}
	}

	const handleSimpleSale = async (saleData: SaleData) => {
		try {
			// Formatear datos para el backend
			const formattedData = {
				customerId: saleData.customerId,
				payments: saleData.payments.map(payment => ({
					method: payment.method,
					amount: payment.amount,
					...(payment.transferNumber && {
						transferNumber: payment.transferNumber,
					}),
				})),
				items: saleData.items.map(item => ({
					productId: item.productId,
					quantity: item.quantity,
					discountPercentage: item.discount,
					discountAmount: item.discountAmount,
				})),
			}

			const response = await createSimpleSale(formattedData)

			// Manejar el PDF desde la respuesta del backend
			if (response.data?.pdfVoucher) openPDFInNewTab(response.data.pdfVoucher)

			return response
		} catch (error) {
			throw error
		}
	}

	// Mostrar spinner inicial mientras se carga el sistema por primera vez
	if (isInitialLoading) {
		return (
			<div className='flex h-[calc(100vh-0.5rem)] min-h-[calc(100vh-0.5rem)] w-full gap-4'>
				<InitialLoadingSpinner />
			</div>
		)
	}

	return (
		<div className='flex h-[calc(100vh-0.5rem)] min-h-[calc(100vh-0.5rem)] w-full gap-4 pb-10'>
			<div className='flex flex-1 flex-col space-y-3 pb-6'>
				<div className='flex flex-shrink-0 items-center justify-between px-2 pr-4'>
					<motion.div
						key={selectedCategory ? 'category-selected' : 'categories'}
						variants={sectionVariants}
						initial='hidden'
						animate='visible'
						exit='hidden'
						className='flex items-center gap-3'>
						{!selectedCategory ? (
							<Typography variant='lead' className='uppercase'>
								Categorías
							</Typography>
						) : (
							<>
								<ActionButton
									onClick={handleBackToCategories}
									icon={<Icons.iconArrowLeft />}
									variant='secondary'
									size='icon'
									className='h-9 w-9'
								/>
								<Typography variant='lead' className='uppercase'>
									{currentCategory?.name}
								</Typography>
							</>
						)}
					</motion.div>

					{/* Barra de búsqueda */}
					<div className='relative'>
						<Icons.search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
						<Input
							ref={searchInputRef}
							placeholder='Buscar por nombre o códigos...'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className='bg-card focus:border-primary h-8 rounded-md border-2 pr-4 pl-9'
							disabled={isValidatingStock}
						/>
						{searchTerm && (
							<div className='absolute top-1/2 right-1 flex -translate-y-1/2 gap-1'>
								<ActionButton
									onClick={() => setSearchTerm('')}
									icon={<Icons.x />}
									variant='ghost'
									size='icon'
									className='text-muted-foreground hover:text-foreground h-6 w-6 rounded-full'
									disabled={isValidatingStock}
								/>
							</div>
						)}
					</div>
				</div>

				<ScrollArea className='flex-1 overflow-auto pr-2'>
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
											<div key={product.id} className='relative'>
												{/* Card */}
												<ProductCard
													product={product}
													onAddToCart={handleAddToCart}
													onSelect={() => setSelectedProductIndex(index)}
													disabled={isValidatingStock && selectedProductIndex === index}
												/>

												{/* Overlay con spinner solo en la card seleccionada */}
												{isValidatingStock && selectedProductIndex === index && (
													<div className='bg-popover/50 absolute inset-0 z-10 flex items-center justify-center rounded-2xl'>
														<Icons.spinnerSimple className='text-primary h-6 w-6 animate-spin' />
													</div>
												)}
											</div>
										))}
									</motion.div>
								)}
							</motion.div>
						)}

						{/* Mostrar categorías solo cuando no hay búsqueda ni categoría seleccionada */}
						{!debouncedSearchTerm.length && !selectedCategory && (
							<motion.div variants={sectionVariants} initial='hidden' animate='visible'>
								{loadingCategories ? (
									<motion.div
										variants={containerVariants}
										initial='hidden'
										animate='visible'
										className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
										<CategoryCardSkeleton count={24} />
									</motion.div>
								) : (
									<motion.div
										variants={containerVariants}
										initial='hidden'
										animate='visible'
										className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
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
				<div className='px-4'>
					<FooterPublic />
				</div>
			</div>

			{/* Sidebar del carrito */}
			<CartSidebar handleSriSale={handleSriSale} handleSimpleSale={handleSimpleSale} />
		</div>
	)
}
