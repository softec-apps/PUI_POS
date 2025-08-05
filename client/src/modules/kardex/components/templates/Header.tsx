'use client'

import { motion } from 'framer-motion'
import { Typography } from '@/components/ui/typography'

interface KardexHeaderProps {
	title: string
	subtitle: string
}

export function KardexHeader({ title, subtitle }: KardexHeaderProps) {
	return (
		<motion.section
			initial={{ opacity: 0, y: -12, filter: 'blur(0px)' }}
			animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
			transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
			className='flex items-center justify-between'>
			<div className='flex flex-col gap-2'>
				<div className='flex items-baseline gap-4'>
					<Typography variant='h3' className='font-bold'>
						{title}
					</Typography>
				</div>
				<Typography variant='span'>{subtitle}</Typography>
			</div>
		</motion.section>
	)
}
