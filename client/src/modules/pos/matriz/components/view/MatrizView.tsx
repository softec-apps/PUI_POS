'use client'

import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import React, { useState, useEffect, useRef } from 'react'

import { useProduct } from '@/common/hooks/useProduct'
import { useCategory } from '@/common/hooks/useCategory'
import { useDebounce } from '@/common/hooks/useDebounce'

import { Star, Search, ImageIcon, Filter, Plus } from 'lucide-react'
import { Typography } from '@/components/ui/typography'
import { EmptyState } from '@/components/layout/organims/EmptyState'

import { useCartStore } from '@/common/stores/useCartStore'

import { Icons } from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { CartSidebar } from '@/modules/pos/matriz/components/organims/CartSidebar'
import { ProductCard, ProductCardSkeleton } from '@/modules/pos/matriz/components/organims/ProductCard'
import { CategoryCard, CategoryCardSkeleton } from '@/modules/pos/matriz/components/organims/CategoryCard'

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

export function MatrizView() {
	const [selectedCategory, setSelectedCategory] = useState('all')
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedProductIndex, setSelectedProductIndex] = useState(-1)
	const [isSearchFocused, setIsSearchFocused] = useState(false)

	const debouncedSearchTerm = useDebounce(searchTerm, 300) // Reducido para respuesta más rápida
	const searchInputRef = useRef(null)

	const [page, setPage] = useState(1)

	// Cart store
	const { addItem } = useCartStore()

	const { categories: categoryData, loading: loadingCategories } = useCategory()
	const {
		recordsData: productResponse,
		loading: productLoading,
		refetchRecords: refetchProducts,
	} = useProduct({
		search: debouncedSearchTerm,
		filters: selectedCategory !== 'all' ? { categoryId: selectedCategory } : undefined,
		page,
		limit: 16,
	})

	useEffect(() => {
		refetchProducts()
		setSelectedProductIndex(-1) // Reset selection on new search
	}, [debouncedSearchTerm, page, selectedCategory])

	const allProducts = productResponse?.data?.items || []

	const categories = [
		{
			id: 'all',
			name: 'Todos',
			photo: '',
			itemCount: productResponse?.data?.pagination?.totalRecords || 0,
		},
		...(categoryData?.data?.items.map(cat => ({
			id: cat.id,
			name: cat.name,
			photo: cat.photo,
			itemCount: 0,
		})) ?? []),
	]

	// Función mejorada para añadir al carrito con feedback visual
	const handleAddToCart = product => {
		addItem({
			id: product.id,
			name: product.name,
			price: product.price,
			code: product.code,
		})

		// Limpiar búsqueda después de añadir si hay coincidencia exacta
		if (allProducts.length === 1 && searchTerm.length > 0) {
			setSearchTerm('')
			searchInputRef.current?.focus()
		}
	}

	// Función para añadir producto seleccionado con Enter
	const handleAddSelectedProduct = () => {
		if (selectedProductIndex >= 0 && selectedProductIndex < allProducts.length) {
			const selectedProduct = allProducts[selectedProductIndex]
			if (selectedProduct.stock > 0) {
				handleAddToCart(selectedProduct)
			}
		}
	}

	// Manejo de teclas para navegación y selección rápida
	const handleKeyDown = e => {
		if (!isSearchFocused || allProducts.length === 0) return

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault()
				setSelectedProductIndex(prev => (prev < allProducts.length - 1 ? prev + 1 : 0))
				break
			case 'ArrowUp':
				e.preventDefault()
				setSelectedProductIndex(prev => (prev > 0 ? prev - 1 : allProducts.length - 1))
				break
			case 'Enter':
				e.preventDefault()
				if (allProducts.length === 1) {
					// Si hay solo un producto, añadirlo directamente
					handleAddToCart(allProducts[0])
				} else if (selectedProductIndex >= 0) {
					// Si hay uno seleccionado, añadirlo
					handleAddSelectedProduct()
				}
				break
			case 'Escape':
				setSearchTerm('')
				setSelectedProductIndex(-1)
				break
		}
	}

	// Auto-seleccionar primer producto cuando hay resultados
	useEffect(() => {
		if (allProducts.length > 0 && searchTerm.length > 0) {
			setSelectedProductIndex(0)
		} else {
			setSelectedProductIndex(-1)
		}
	}, [allProducts.length, searchTerm])

	const handlePlaceOrder = () => {
		const { getTotal } = useCartStore.getState()
		const total = getTotal()
	}

	return (
		<div className='flex h-[calc(100vh-4rem)] min-h-[calc(100vh-4rem)] w-full gap-4'>
			<div className='flex flex-1 flex-col'>
				<ScrollArea className='overflow-auto pr-2'>
					<div className='space-y-6 pb-4' onKeyDown={handleKeyDown}>
						{/* Categorías */}
						<motion.div
							variants={sectionVariants}
							initial='hidden'
							animate='visible'
							transition={{ delay: 0.2 }}
							className='space-y-4 px-2'>
							{loadingCategories ? (
								<motion.div
									variants={containerVariants}
									initial='hidden'
									animate='visible'
									className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
									<CategoryCardSkeleton count={6} />
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
											isSelected={selectedCategory === category.id}
											onSelect={() => setSelectedCategory(category.id)}
										/>
									))}
								</motion.div>
							)}
						</motion.div>

						{/* Barra de búsqueda mejorada */}
						<motion.div
							variants={sectionVariants}
							initial='hidden'
							animate='visible'
							transition={{ delay: 0.1 }}
							className='px-2'>
							<div className='relative'>
								<Search className='text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform' />
								<Input
									ref={searchInputRef}
									placeholder='Buscar productos por nombre, código... (Enter para añadir)'
									value={searchTerm}
									onChange={e => setSearchTerm(e.target.value)}
									onFocus={() => setIsSearchFocused(true)}
									onBlur={() => setIsSearchFocused(false)}
									className={`bg-card focus:border-primary h-12 border-2 pr-12 pl-12 text-base shadow-sm ${searchTerm && allProducts.length === 1 ? 'border-green-500 focus:border-green-500' : ''} `}
								/>
								{searchTerm && (
									<div className='absolute top-1/2 right-2 flex -translate-y-1/2 gap-1'>
										{allProducts.length === 1 && (
											<ActionButton
												onClick={() => handleAddToCart(allProducts[0])}
												icon={<Plus className='h-4 w-4' />}
												variant='default'
												size='sm'
												className='rounded-full'
												title='Añadir al carrito (Enter)'
											/>
										)}
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
						</motion.div>

						{/* Productos con selección mejorada */}
						<motion.div
							variants={sectionVariants}
							initial='hidden'
							animate='visible'
							transition={{ delay: 0.3 }}
							className='space-y-4'>
							{productLoading ? (
								<motion.div
									variants={containerVariants}
									initial='hidden'
									animate='visible'
									className='grid grid-cols-2 gap-4 px-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
									<ProductCardSkeleton count={16} />
								</motion.div>
							) : allProducts.length === 0 ? (
								<div className='px-2'>
									<EmptyState />
								</div>
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
					</div>
				</ScrollArea>
			</div>

			{/* Sidebar del carrito */}
			<CartSidebar isOpen={true} onClose={() => {}} onPlaceOrder={handlePlaceOrder} />
		</div>
	)
}
