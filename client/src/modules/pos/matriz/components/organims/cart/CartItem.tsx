'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Typography } from '@/components/ui/typography'
import { OrderItem } from '@/common/stores/useCartStore'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Icons } from '@/components/icons'

interface CartItemProps {
	item: OrderItem
	index: number
	onUpdateQuantity: (id: string, change: number) => void
	onRemoveItem: (id: string) => void
}

const itemVariants = {
	hidden: { opacity: 0, x: 20, scale: 0.95 },
	visible: {
		opacity: 1,
		x: 0,
		scale: 1,
		transition: {
			type: 'spring',
			stiffness: 400,
			damping: 25,
		},
	},
	exit: {
		opacity: 0,
		x: -20,
		scale: 0.9,
		transition: { duration: 0.2 },
	},
}

export const CartItem: React.FC<CartItemProps> = ({ item, index, onUpdateQuantity, onRemoveItem }) => (
	<motion.div
		key={item.id}
		variants={itemVariants}
		initial='hidden'
		animate='visible'
		exit='exit'
		layout
		custom={index}
		className='group py-2'>
		<Card className='bg-card dark:bg-accent/15 border-none p-0 shadow-none transition-colors duration-500'>
			<CardContent className='p-4'>
				<div className='flex items-start gap-3'>
					<div className='min-w-0 flex-1'>
						<div className='flex items-center justify-between gap-4'>
							<div className='flex flex-col gap-2'>
								<ActionButton
									variant='secondary'
									size='sm'
									tooltip='Aumentar'
									onClick={() => onUpdateQuantity(item.id, 1)}
									icon={<Plus className='h-4 w-4' />}
								/>
								<ActionButton
									variant='secondary'
									size='sm'
									tooltip='Disminuir'
									disabled={item.quantity === 1}
									onClick={() => onUpdateQuantity(item.id, -1)}
									icon={<Minus className='h-4 w-4' />}
								/>
							</div>

							<div className='flex-1 space-y-2'>
								<Typography variant='h6' className='line-clamp-1 break-words'>
									{item.name}
								</Typography>

								<Typography variant='overline' className='line-clamp-1 flex gap-2 font-medium break-words'>
									# {item?.code || 'N/A'}
								</Typography>

								<div className='flex items-center justify-between gap-4'>
									<Typography variant='overline' className='line-clamp-1 flex gap-2 font-medium break-words'>
										{item.quantity} x ${item.price.toFixed(2)} ={' '}
										<strong>${(item.quantity * item.price).toFixed(2)}</strong>
									</Typography>
								</div>
							</div>

							<ActionButton
								variant='secondary'
								size='pos'
								tooltip='Remover'
								className='bg-destructive/20 text-destructive hover:bg-destructive/30'
								onClick={() => onRemoveItem(item.id)}
								icon={<Icons.x className='h-4 w-4' />}
							/>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	</motion.div>
)
