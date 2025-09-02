'use client'
import { motion } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'
import { Typography } from '@/components/ui/typography'
import { numberHumanize } from '@/common/utils/numberHumanize-util'
import { Skeleton } from '@/components/ui/skeleton'

export interface ModuleHeaderProps {
	title: string
	totalRecords: number
	actionContent: ReactNode
	loading: boolean
	animation?: {
		disabled?: boolean
		duration?: number
	}
}

const DEFAULT_ANIMATION = {
	duration: 0.4,
	easing: [0.23, 1, 0.32, 1] as const,
}

export function ModuleHeader({
	title,
	totalRecords,
	actionContent,
	loading,
	animation = DEFAULT_ANIMATION,
}: ModuleHeaderProps) {
	const [displayedTotal, setDisplayedTotal] = useState(totalRecords)

	useEffect(() => setDisplayedTotal(totalRecords), [totalRecords])

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
			<div className='flex items-center gap-2'>
				<Typography variant='h3' className='font-bold'>
					{title}
				</Typography>

				<div className='flex items-center gap-2'>
					<Typography
						variant='overline'
						className='bg-accent text-primary rounded-xl px-2.5 py-1.5 text-sm font-medium'>
						{loading ? <Skeleton className='h-5 w-5 rounded-xl' /> : <>{numberHumanize(displayedTotal)}</>}
					</Typography>
				</div>
			</div>
			<div className='flex gap-2'>{actionContent}</div>
		</motion.section>
	)
}
