'use client'

import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { motion } from 'framer-motion'

type Props = {
	text?: string
	inline?: boolean
}

export const SpinnerLoader = ({ text, inline = false }: Props) => {
	return (
		<div className={`flex items-center justify-center gap-2 ${inline ? 'flex-row' : 'flex-col gap-4'}`}>
			<Icons.spinnerDecored className='animate-spin' />
			{text && (
				<motion.div
					initial={inline ? { opacity: 0, x: -10 } : { opacity: 0, y: -20 }}
					animate={{ opacity: 1, x: 0, y: 0 }}
					transition={{ duration: 0.3 }}>
					<Typography variant='small'>{text}</Typography>
				</motion.div>
			)}
		</div>
	)
}
