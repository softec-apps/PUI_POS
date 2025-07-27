'use client'

import { motion } from 'framer-motion'
import { CardTitle } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { ReactNode } from 'react'

type Props = {
	title: string
	description?: string
	icon: ReactNode
}

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
			when: 'beforeChildren',
		},
	},
}

const itemVariants = {
	hidden: { opacity: 0, y: -10 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.3,
		},
	},
}

const iconVariants = {
	hover: {
		rotate: [0, 5, -5, 0],
		y: [0, 0, 0],
		transition: {
			rotate: {
				repeat: Infinity,
				repeatType: 'reverse',
				duration: 3,
				ease: 'easeInOut',
			},
			y: {
				repeat: Infinity,
				repeatType: 'reverse',
				duration: 2.5,
				ease: 'easeInOut',
			},
		},
	},
}

export const UtilBanner = ({ title, description, icon }: Props) => {
	return (
		<div className='text-primary'>
			<motion.div
				variants={containerVariants}
				initial='hidden'
				animate='visible'
				className='flex flex-col items-center gap-2'>
				<CardTitle className='flex flex-col items-center gap-4 text-center'>
					<motion.div variants={itemVariants} whileHover='hover' className='flex justify-center'>
						<motion.div variants={iconVariants}>{icon}</motion.div>
					</motion.div>

					<motion.div variants={itemVariants} className='space-y-2'>
						<Typography variant='h6'>{title}</Typography>
						{description && <Typography variant='small'>{description}</Typography>}
					</motion.div>
				</CardTitle>
			</motion.div>
		</div>
	)
}
