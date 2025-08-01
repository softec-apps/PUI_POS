'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { UtilBanner } from '@/components/UtilBanner'

export const CartEmptyState: React.FC = () => (
	<motion.div
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ delay: 0.3 }}
		className='flex flex-col items-center justify-center py-20 text-center'>
		<UtilBanner
			icon={<ShoppingBag className='h-8 w-8' />}
			title='Carrito vacío'
			description='Agrega productos para comenzar tu venta'
		/>
	</motion.div>
)
