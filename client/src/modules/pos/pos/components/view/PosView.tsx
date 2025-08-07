'use client'

import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import React, { useState, useEffect } from 'react'

import { useProduct } from '@/common/hooks/useProduct'
import { useCategory } from '@/common/hooks/useCategory'
import { useDebounce } from '@/common/hooks/useDebounce'

import { Star, Search, ImageIcon } from 'lucide-react'
import { Typography } from '@/components/ui/typography'
import { EmptyState } from '@/components/layout/organims/EmptyState'

import { I_Category } from '@/common/types/modules/category'
import { useCartStore } from '@/common/stores/useCartStore'

import { Icons } from '@/components/icons'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { CartSidebar } from '@/modules/pos/pos/components/organims/CartSidebar'
import { PaginationControls } from '@/modules/pos/pos/components/template/Pagination'
import { ProductCard, ProductCardSkeleton } from '@/modules/pos/pos/components/organims/ProductCard'
import { CategoryCard, CategoryCardSkeleton } from '@/modules/pos/pos/components/organims/CategoryCard'

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
}

export function PosView() {
	const [selectedCategory, setSelectedCategory] = useState('all')
	const [searchTerm, setSearchTerm] = useState('')
	const debouncedSearchTerm = useDebounce(searchTerm, 400)

	const [page, setPage] = useState(1)
	const [limit, setLimit] = useState(10)

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
		limit: 12,
	})

	useEffect(() => {
		refetchProducts()
	}, [debouncedSearchTerm, page, selectedCategory])

	const allProducts = productResponse?.data?.items || []

	const pagination = productResponse?.data?.pagination || {
		totalCount: 0,
		totalPages: 1,
		currentPage: 1,
		hasNextPage: false,
		hasPreviousPage: false,
		lastPage: 1,
		firstPage: 1,
	}

	const categories: I_Category[] = [
		{
			id: 'all',
			name: 'Todos',
			photo: Star,
			itemCount: productResponse?.data?.pagination?.totalRecords || 0,
		},
		...(categoryData?.data?.items.map(cat => ({
			id: cat.id,
			name: cat.name,
			photo: ImageIcon,
			itemCount: 0,
		})) ?? []),
	]

	const handleAddToCart = (product: { id: string; name: string; price: number; code?: string }) => {
		addItem(product)
	}

	const handlePlaceOrder = () => {
		const { getTotal } = useCartStore.getState()
		const total = getTotal()
		//	alert(`¡Orden procesada con éxito!\nTotal: $${total.toFixed(2)}`)
	}

	const onPrevPage = () => {
		if (page > 1) setPage(page - 1)
	}

	const onNextPage = () => {
		if (pagination.hasNextPage) setPage(page + 1)
	}

	return (
		<div className='flex h-[calc(100vh-4rem)] min-h-[calc(100vh-4rem)] w-full gap-3'>
			<div className='flex flex-1 flex-col'>
				<ScrollArea className='overflow-auto pr-4'>
					<div className='space-y-4'>
						{/* Categories */}
						<div className='space-y-4 px-1'>
							<Typography variant='lead'>Categorias</Typography>
							{loadingCategories ? (
								<motion.div
									variants={containerVariants}
									initial='hidden'
									animate='visible'
									className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-3'>
									<CategoryCardSkeleton count={6} />
								</motion.div>
							) : (
								<motion.div
									variants={containerVariants}
									initial='hidden'
									animate='visible'
									className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-3'>
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

						{/* Products */}
						<div className='space-y-4'>
							<Typography variant='lead' className=''>
								Productos
							</Typography>

							<div className='flex items-center justify-between px-1'>
								{/* Pagination */}
								<PaginationControls
									loading={productLoading}
									pagination={{ page, limit }}
									onPrevPage={onPrevPage}
									onNextPage={onNextPage}
									metaDataPagination={pagination}
									onPageChange={setPage}
								/>

								{/* Search input */}
								<div className='relative w-full pt-0.5 sm:w-64'>
									<Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
									<Input
										placeholder='Buscar productos...'
										value={searchTerm}
										onChange={e => setSearchTerm(e.target.value)}
										className='bg-card h-10 pl-9 shadow-none'
									/>

									{/* Clear button */}
									{searchTerm && (
										<ActionButton
											onClick={() => setSearchTerm('')}
											icon={<Icons.x />}
											variant='secondary'
											className='text-muted-foreground hover:text-foreground absolute top-1/2 right-1 -translate-y-1/2 rounded-full'
										/>
									)}
								</div>
							</div>

							{productLoading ? (
								<motion.div
									variants={containerVariants}
									initial='hidden'
									animate='visible'
									className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 lg:gap-4 xl:grid-cols-4'>
									<ProductCardSkeleton count={10} />
								</motion.div>
							) : allProducts.length === 0 ? (
								<EmptyState />
							) : (
								<motion.div
									variants={containerVariants}
									initial='hidden'
									animate='visible'
									className='grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 lg:gap-3 xl:grid-cols-4'>
									{allProducts.map(product => (
										<ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
									))}
								</motion.div>
							)}
						</div>
					</div>
				</ScrollArea>
			</div>

			<CartSidebar isOpen={true} onClose={() => {}} onPlaceOrder={handlePlaceOrder} />
		</div>
	)
}
