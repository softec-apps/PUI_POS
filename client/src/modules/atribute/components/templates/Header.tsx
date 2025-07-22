'use client'

import { motion } from 'framer-motion'
import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

interface Props {
	onCreateClick: () => void
}

export function AtributeHeader({ onCreateClick }: Props) {
	return (
		<motion.section
			initial={{ opacity: 0, y: -12, filter: 'blur(0px)' }}
			animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
			transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
			className='flex items-center justify-between'>
			<div className='flex flex-col gap-2'>
				<div className='flex items-baseline gap-4'>
					<Typography variant='h3' className='font-bold'>
						Atributos
					</Typography>
				</div>
				<Typography variant='span'>Gestiona los atributos de tus productos</Typography>
			</div>

			<div className='flex gap-2'>
				<ActionButton size='lg' variant='default' icon={<Icons.plus />} text='Nuevo atributo' onClick={onCreateClick} />
			</div>
		</motion.section>
	)
}
