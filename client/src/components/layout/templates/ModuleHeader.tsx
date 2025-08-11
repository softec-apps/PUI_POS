'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { Typography } from '@/components/ui/typography'
import { numberHumanize } from '@/common/utils/numberHumanize-util'

export interface ModuleHeaderProps {
	title: string
	totalRecords: number
	loading: boolean
	actionContent: ReactNode
	animation?: {
		disabled?: boolean
		duration?: number
	}
}

// Configuración de animación por defecto
const DEFAULT_ANIMATION = {
	duration: 0.4,
	easing: [0.23, 1, 0.32, 1] as const,
}

export function ModuleHeader({
	title,
	totalRecords,
	loading,
	actionContent,
	animation = DEFAULT_ANIMATION,
}: ModuleHeaderProps) {
	// Props de animación condicionales
	const motionProps = animation.disabled
		? {}
		: {
				initial: { opacity: 0, y: -12 },
				animate: { opacity: 1, y: 0 },
				transition: {
					duration: animation.duration ?? DEFAULT_ANIMATION.duration,
					ease: DEFAULT_ANIMATION.easing,
				},
			}

	return (
		<motion.section {...motionProps} className='flex items-center justify-between'>
			{/* Sección de título y contador */}
			<div className='flex items-center gap-2'>
				<Typography variant='h3' className='font-bold'>
					{title}
				</Typography>
				{loading ? (
					<Skeleton className='h-9 w-9 rounded-xl' />
				) : (
					<Typography variant='overline' className='bg-accent rounded-xl px-2.5 py-1.5 text-base font-bold'>
						{numberHumanize(totalRecords)}
					</Typography>
				)}
			</div>

			{/* Sección de acciones */}
			<div className='flex gap-2'>{actionContent}</div>
		</motion.section>
	)
}
