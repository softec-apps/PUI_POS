'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { I_Category } from '@/common/types/modules/category'

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
		<motion.div variants={itemVariants} whileHover={{ scale: 1 }} whileTap={{ scale: 0.95 }}>
			<Card
				className={cn(
					'bg-card dark:bg-accent/10 cursor-pointer border-none p-0 shadow-none transition-all duration-500',
					isSelected ? 'bg-accent dark:bg-accent/50' : ''
				)}
				onClick={onSelect}>
				<CardContent className='p-0'>
					<div className='flex items-center gap-2 px-4 py-3 lg:gap-3'>
						<div
							className={cn(
								'flex h-8 w-8 items-center justify-center rounded-lg lg:h-10 lg:w-10',
								isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'
							)}>
							<IconComponent className='h-4 w-4 lg:h-5 lg:w-5' />
						</div>
						<div className='min-w-0 flex-1'>
							<h3 className='truncate text-xs font-semibold lg:text-sm'>{category?.name}</h3>
							<p className='text-muted-foreground text-xs'>{category?.itemCount} items</p>
						</div>
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
				<Card key={i} className='border-border bg-muted/20 p-0'>
					<CardContent className='p-0'>
						<div className='flex items-center gap-2 px-4 py-3 lg:gap-3'>
							<Skeleton className='h-8 w-8 rounded-lg lg:h-10 lg:w-10' />
							<div className='min-w-0 flex-1 space-y-1'>
								<Skeleton className='h-3 w-3/4' />
								<Skeleton className='h-2 w-1/2' />
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</>
	)
}
