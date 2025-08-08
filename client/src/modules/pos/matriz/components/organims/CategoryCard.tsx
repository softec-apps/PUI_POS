'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { I_Category } from '@/common/types/modules/category'
import Image from 'next/image'

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
					'h-full cursor-pointer border-2 p-0 transition-all duration-500',
					isSelected ? 'border-primary ring-primary/50 ring-2' : 'hover:border-primary/50'
				)}
				onClick={onSelect}>
				<CardContent className='flex h-full flex-col p-0'>
					<div className='relative h-full w-full overflow-hidden'>
						<Image
							alt={category?.name || 'Category image'}
							src={
								category?.photo?.path ||
								'https://us.123rf.com/450wm/dustin999/dustin9992302/dustin999230203648/199476687-icono-de-imagen-en-estilo-plano-moderno-aislado-en-el-s%C3%ADmbolo-de-imagen-de-fondo-gris-para-el-dise%C3%B1o.jpg?ver=6'
							}
							fill
							className='rounded-t-lg object-cover'
							unoptimized
						/>
					</div>

					<div className='bg-background right-0 bottom-0 left-0 rounded-b-lg border-t p-2 text-center'>
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
