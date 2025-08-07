'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { I_Category } from '@/common/types/modules/category'
import { Check } from 'lucide-react'

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
}

interface CardProps {
	category?: I_Category
	isSelected?: boolean
	onSelect?: () => void
}

export const CategoryCard: React.FC<CardProps> = ({ category, isSelected = false, onSelect = () => {} }) => {
	const IconComponent = category?.photo

	return (
		<motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className='relative'>
			<Card
				className={cn(
					'cursor-pointer border-2 shadow-sm transition-all duration-300 hover:shadow-md',
					'relative min-h-[100px] overflow-hidden',
					isSelected
						? 'border-primary bg-primary/5 ring-primary/20 shadow-md ring-2'
						: 'border-border bg-card hover:border-primary/50 hover:bg-accent/50'
				)}
				onClick={onSelect}>
				{/* Indicador de selección */}
				{isSelected && (
					<div className='bg-primary text-primary-foreground absolute top-2 right-2 z-10 rounded-full p-1'>
						<Check className='h-3 w-3' />
					</div>
				)}

				<CardContent className='flex h-full flex-col justify-between p-4'>
					{/* Contenido principal */}
					<div className='flex flex-col items-center space-y-3 text-center'>
						{/* Ícono grande */}
						<div
							className={cn(
								'flex h-12 w-12 items-center justify-center rounded-xl transition-colors',
								'lg:h-14 lg:w-14',
								isSelected
									? 'bg-primary text-primary-foreground shadow-lg'
									: 'bg-muted text-muted-foreground group-hover:bg-primary/10'
							)}>
							<IconComponent className='h-6 w-6 lg:h-7 lg:w-7' />
						</div>

						{/* Nombre de categoría */}
						<div className='space-y-1'>
							<h3
								className={cn(
									'text-sm leading-tight font-semibold lg:text-base',
									isSelected ? 'text-primary' : 'text-foreground'
								)}>
								{category?.name}
							</h3>

							{/* Badge con contador */}
							<Badge variant={isSelected ? 'default' : 'secondary'} className='px-2 py-0.5 text-xs'>
								{category?.itemCount || 0} items
							</Badge>
						</div>
					</div>

					{/* Indicador visual de estado activo */}
					<div
						className={cn(
							'absolute right-0 bottom-0 left-0 h-1 transition-all duration-300',
							isSelected ? 'bg-primary' : 'bg-transparent'
						)}
					/>
				</CardContent>
			</Card>
		</motion.div>
	)
}

interface SkeletonCardProps {
	count?: number
}

export const CategoryCardSkeleton: React.FC<SkeletonCardProps> = ({ count = 6 }) => {
	return (
		<>
			{Array.from({ length: count }).map((_, i) => (
				<motion.div
					key={`category-skeleton-${i}`}
					variants={itemVariants}
					initial='hidden'
					animate='visible'
					transition={{ delay: i * 0.1 }}>
					<Card className='border-border bg-muted/20 min-h-[100px]'>
						<CardContent className='flex h-full flex-col justify-between p-4'>
							<div className='flex flex-col items-center space-y-3 text-center'>
								{/* Skeleton del ícono */}
								<Skeleton className='h-12 w-12 rounded-xl lg:h-14 lg:w-14' />

								{/* Skeleton del texto */}
								<div className='w-full space-y-2'>
									<Skeleton className='mx-auto h-4 w-3/4' />
									<Skeleton className='mx-auto h-5 w-16 rounded-full' />
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>
			))}
		</>
	)
}
