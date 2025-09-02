'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

import { Icons } from '@/components/icons'
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
	return (
		<motion.div
			variants={itemVariants}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			className='aspect-square w-full'>
			<Card
				className={cn(
					'h-auto cursor-pointer border-2 p-0 transition-all duration-500',
					isSelected ? 'border-primary ring-primary/50 ring-2' : 'hover:border-primary/50'
				)}
				onClick={onSelect}>
				<CardContent className='flex h-full flex-col p-0'>
					<div className='bg-muted relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-t-2xl'>
						{category?.photo ? (
							<Image
								src={category?.photo?.path}
								alt={category?.name}
								width={200}
								height={200}
								unoptimized
								className='h-full w-full object-cover transition-transform group-hover:scale-105'
							/>
						) : (
							<Icons.media className='text-muted-foreground h-8 w-8' />
						)}
					</div>

					<div className='bg-background rounded-b-2xl border-t p-2 text-center'>
						<h3 className={cn('text-primary text-sm font-medium', isSelected && 'text-primary')}>{category?.name}</h3>
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
				<motion.div key={`category-skeleton-${i}`} variants={itemVariants} className='aspect-square w-full'>
					<Card className='border-border h-full'>
						<CardContent className='h-full p-0'>
							<Skeleton className='h-full w-full' />
						</CardContent>
					</Card>
				</motion.div>
			))}
		</>
	)
}
