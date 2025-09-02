'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { I_Category } from '@/common/types/modules/category'

const itemVariants = {
	hidden: { opacity: 0, y: 8 },
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
		<motion.div
			variants={itemVariants}
			initial='hidden'
			animate='visible'
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			transition={{ duration: 0.15 }}>
			<Card
				onClick={onSelect}
				className={cn(
					'cursor-pointer rounded-xl border transition-all duration-200',
					isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:bg-accent/40'
				)}>
				<CardContent className='flex items-center gap-4 p-4'>
					<div
						className={cn(
							'flex h-12 w-12 items-center justify-center rounded-lg transition-colors',
							isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
						)}>
						<IconComponent className='h-6 w-6' />
					</div>

					<div className='min-w-0 flex-1'>
						<p className={cn('truncate text-sm font-medium', isSelected && 'text-primary')}>{category?.name}</p>
						<span className='text-muted-foreground text-xs'>
							{category?.itemCount} {category?.itemCount === 1 ? 'item' : 'items'}
						</span>
					</div>
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
				<Card key={i} className='rounded-xl border p-0'>
					<CardContent className='flex items-center gap-4 p-4'>
						<Skeleton className='h-12 w-12 rounded-lg' />
						<div className='min-w-0 flex-1 space-y-2'>
							<Skeleton className='h-4 w-3/4' />
							<Skeleton className='h-3 w-1/2' />
						</div>
					</CardContent>
				</Card>
			))}
		</>
	)
}
