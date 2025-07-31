'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { Typography } from '@/components/ui/typography'

export const ProcessingScreen: React.FC = () => (
	<motion.div
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		className='bg-background/95 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm'>
		<div className='space-y-6 text-center'>
			<motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
				<Loader2 className='text-primary mx-auto h-16 w-16' />
			</motion.div>
			<div className='space-y-2'>
				<Typography variant='h4'>Procesando venta...</Typography>
				<Typography variant='muted' className='text-muted-foreground'>
					Por favor espera mientras procesamos tu pago
				</Typography>
			</div>
			<div className='bg-muted/50 max-w-md rounded-lg p-4'>
				<Typography variant='small' className='text-muted-foreground'>
					No cierres esta ventana ni recargues la página
				</Typography>
			</div>
		</div>
	</motion.div>
)
