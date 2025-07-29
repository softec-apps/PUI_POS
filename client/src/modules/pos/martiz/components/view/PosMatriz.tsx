'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Search, ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { CategoryCard, CategoryCardSkeleton } from '../organims/CategoryCard'
import { ProductCard, ProductCardSkeleton } from '../organims/ProductCard'
import { PosFooter } from '../organims/PosFooter'
import { CartSidebar } from '../organims/CartSidebar'
import { PaginationControls } from '../template/Pagination'
import { useCategory } from '@/common/hooks/useCategory'
import { useProduct } from '@/common/hooks/useProduct'
import { useDebounce } from '@/common/hooks/useDebounce'
import { EmptyState } from '@/components/layout/organims/EmptyState'

interface OrderItem {
	id: string
	name: string
	price: number
	quantity: number
}

interface Customer {
	id: string
	name: string
	email?: string
	phone?: string
}

interface Category {
	id: string
	name: string
	photo: React.ComponentType<{ className?: string }>
	itemCount: number
}

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
}

export function POSMatriz() {
	const [selectedCategory, setSelectedCategory] = useState('all')
	const [orderItems, setOrderItems] = useState<OrderItem[]>([])
	const [selectedPayment, setSelectedPayment] = useState('cash')
	const [isCartOpen, setIsCartOpen] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const debouncedSearchTerm = useDebounce(searchTerm, 400)

	const [page, setPage] = useState(1)
	const [limit, setLimit] = useState(10)

	const { categories: categoryData, loading: loadingCategories } = useCategory()
	const {
		recordsData: productResponse,
		loading: productLoading,
		refetchRecords: refetchProducts,
	} = useProduct({
		search: debouncedSearchTerm,
		page,
		limit,
	})

	useEffect(() => {
		refetchProducts()
	}, [debouncedSearchTerm, page, limit])

	const allProducts = productResponse?.data?.items || []

	const pagination = productResponse?.data?.pagination || {
		totalCount: 0,
		totalPages: 1,
		currentPage: 1,
		hasNextPage: false,
		hasPreviousPage: false,
		pageSize: limit,
		lastPage: 1,
		firstPage: 1,
	}

	// Filtra productos según categoría seleccionada
	const filteredProducts =
		selectedCategory === 'all' ? allProducts : allProducts.filter(product => product.category?.id === selectedCategory)

	const categories: Category[] = [
		{
			id: 'all',
			name: 'Todos',
			photo: Star,
			itemCount: allProducts.length,
		},
		...(categoryData?.data?.items.map(cat => ({
			id: cat.id,
			name: cat.name,
			photo: ImageIcon,
			itemCount: allProducts.filter(p => p.category?.id === cat.id).length,
		})) ?? []),
	]

	const customer: Customer = {
		id: '1',
		name: 'Cliente General',
		email: 'cliente@ejemplo.com',
	}

	const handleAddToCart = (product: { id: string; name: string; price: number }) => {
		const existingItem = orderItems.find(item => item.id === product.id)

		if (existingItem) {
			setOrderItems(orderItems.map(item => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
		} else {
			setOrderItems([...orderItems, { id: product.id, name: product.name, price: product.price, quantity: 1 }])
		}
	}

	const handleUpdateQuantity = (id: string, change: number) => {
		setOrderItems(
			orderItems
				.map(item => {
					if (item.id === id) {
						const newQuantity = item.quantity + change
						return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
					}
					return item
				})
				.filter(item => item.quantity > 0)
		)
	}

	const handleRemoveItem = (id: string) => {
		setOrderItems(orderItems.filter(item => item.id !== id))
	}

	const handlePlaceOrder = () => {
		const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.16
		alert(`¡Orden procesada con éxito!\nTotal: $${total.toFixed(2)}\nMétodo: ${selectedPayment}`)
		setOrderItems([])
		setIsCartOpen(false)
	}

	const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.16

	const onPrevPage = () => {
		if (page > 1) setPage(page - 1)
	}
	const onNextPage = () => {
		if (pagination.hasNextPage) setPage(page + 1)
	}
	const onLimitChange = (value: string) => {
		setLimit(Number(value))
		setPage(1)
	}

	return (
		<div className='flex h-full min-h-[calc(100vh-4rem)] w-full gap-4'>
			{/* Main Content */}
			<div className='flex flex-1 flex-col'>
				{/* Search input with icon */}
				<div className='relative mb-4 w-full sm:w-64'>
					<Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
					<Input
						placeholder='Buscar productos...'
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						className='h-9 pl-9'
					/>
				</div>

				<div className='flex-1 space-y-4 overflow-auto lg:space-y-6'>
					{/* Categories */}
					<div className='px-1'>
						<h2 className='mb-3 text-base font-semibold lg:text-lg'>Categorías</h2>
						{loadingCategories ? (
							<motion.div
								variants={containerVariants}
								initial='hidden'
								animate='visible'
								className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-3'>
								<CategoryCardSkeleton count={6} />
							</motion.div>
						) : (
							<motion.div
								variants={containerVariants}
								initial='hidden'
								animate='visible'
								className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-3'>
								{categories.map(category => (
									<CategoryCard
										key={category.id}
										category={category}
										isSelected={selectedCategory === category.id}
										onSelect={() => setSelectedCategory(category.id)}
									/>
								))}
							</motion.div>
						)}
					</div>

					<Separator />

					{/* Paginación */}
					<PaginationControls
						loading={productLoading}
						pagination={{ page, limit }}
						onPrevPage={onPrevPage}
						onNextPage={onNextPage}
						onLimitChange={onLimitChange}
						metaDataPagination={pagination}
						onPageChange={setPage}
					/>

					{/* Productos */}
					<div>
						<h2 className='mb-3 text-base font-semibold lg:text-lg'>Productos ({filteredProducts.length})</h2>

						{productLoading ? (
							<motion.div
								variants={containerVariants}
								initial='hidden'
								animate='visible'
								className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5'>
								<ProductCardSkeleton count={10} />
							</motion.div>
						) : filteredProducts.length === 0 ? (
							<EmptyState />
						) : (
							<motion.div
								variants={containerVariants}
								initial='hidden'
								animate='visible'
								className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 lg:gap-4 xl:grid-cols-5'>
								{filteredProducts.map(product => (
									<ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
								))}
							</motion.div>
						)}
					</div>
				</div>

				<PosFooter orderItems={orderItems} total={total} onToggleCart={() => setIsCartOpen(!isCartOpen)} />
			</div>

			{/* Desktop Cart Sidebar */}
			<div className='hidden w-72 border-l lg:block xl:w-80'>
				<CartSidebar
					isOpen={true}
					onClose={() => {}}
					orderItems={orderItems}
					onUpdateQuantity={handleUpdateQuantity}
					onRemoveItem={handleRemoveItem}
					selectedPayment={selectedPayment}
					onSelectPayment={setSelectedPayment}
					onPlaceOrder={handlePlaceOrder}
					customer={customer}
				/>
			</div>

			{/* Mobile Cart Modal */}
			<CartSidebar
				isOpen={isCartOpen}
				onClose={() => setIsCartOpen(false)}
				orderItems={orderItems}
				onUpdateQuantity={handleUpdateQuantity}
				onRemoveItem={handleRemoveItem}
				selectedPayment={selectedPayment}
				onSelectPayment={setSelectedPayment}
				onPlaceOrder={handlePlaceOrder}
				customer={customer}
			/>
		</div>
	)
}
