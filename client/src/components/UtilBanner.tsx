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
	hidden: { opacity: 0, y: 0, scale: 0.8 },
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.2,
			ease: [0.16, 1, 0.3, 1],
		},
		scale: 1,
	},
}

const itemVariants = {
	hidden: {
		opacity: 0,
		y: 0,
	},
	visible: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.4,
			ease: 'easeOut',
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
					<motion.div
						variants={itemVariants}
						animate={{
							rotate: [0, 5, -5, 0],
							y: [0, -3, 0],
						}}
						transition={{
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
						}}>
						<div className='flex justify-center'>{icon}</div>
					</motion.div>

					<motion.div variants={itemVariants}>
						<Typography variant='h6'>{title}</Typography>
					</motion.div>
				</CardTitle>

				{description && (
					<motion.div variants={itemVariants} className='flex flex-col items-center gap-4 text-center'>
						<Typography variant='small'>{description}</Typography>
					</motion.div>
				)}
			</motion.div>
		</div>
	)
}
