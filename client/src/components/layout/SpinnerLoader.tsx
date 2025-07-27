'use client'

import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { motion } from 'framer-motion'

type Props = {
	text?: string
}

export const SpinnerLoader = ({ text }: Props) => {
	return (
		<div className='flex flex-col items-center justify-center gap-4'>
			<Icons.spinnerDecored className='animate-spin' />
			{text && (
				<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
					<Typography variant='small'>{text}</Typography>
				</motion.div>
			)}
		</div>
	)
}
