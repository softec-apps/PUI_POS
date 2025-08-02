'use client'
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Typography } from '@/components/ui/typography'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'

export const ProcessingScreen: React.FC = () => (
	<motion.div
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0 }}
		className='bg-background/70 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-3xl'>
		<div className='flex flex-col items-center justify-center space-y-1'>
			{/* Spinner que se mueve hacia arriba después de 0.5s */}
			<motion.div initial={{ y: 0 }} animate={{ y: -15 }} transition={{ delay: 0.5, duration: 0.3, ease: 'easeOut' }}>
				<SpinnerLoader />
			</motion.div>

			{/* Texto que aparece desde abajo después de 0.5s */}
			<AnimatePresence>
				<motion.div
					initial={{ y: -15, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.5, duration: 0.3, ease: 'linear' }}
					className='space-y-1 text-center'>
					<Typography variant='h5'>Procesando venta...</Typography>
					<Typography variant='span'>Por favor espera mientras procesamos la venta</Typography>
				</motion.div>
			</AnimatePresence>
		</div>
	</motion.div>
)
