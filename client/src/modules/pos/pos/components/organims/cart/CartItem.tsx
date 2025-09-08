'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'
import { OrderItem } from '@/common/stores/useCartStore'
import { Card, CardContent } from '@/components/ui/card'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { ImageControl } from '@/components/layout/organims/ImageControl'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { toast } from 'sonner'

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

export const CartItem: React.FC<CartItemProps> = ({ item, index, onUpdateQuantity, onRemoveItem }) => {
	return (
		<motion.div
			key={item.id}
			variants={itemVariants}
			initial='hidden'
			animate='visible'
			exit='exit'
			layout
			custom={index}
			className='py-1'>
			<Card className='border-border/50 bg-popover rounded-2xl p-1 pr-2 shadow-none transition-colors duration-500'>
				<CardContent className='p-0'>
					<div className='flex items-start gap-3'>
						<div className='min-w-0 flex-1'>
							<div className='flex items-center justify-between gap-4'>
								<div className='line-clamp-2 w-auto max-w-fit overflow-hidden text-ellipsis whitespace-normal'>
									<ImageControl
										imageUrl={item?.image}
										enableHover={false}
										enableClick={false}
										imageHeight={45}
										imageWidth={45}
									/>
								</div>

								<div className='flex-1 space-y-0.5'>
									<Typography variant='span' className='text-primary line-clamp-1 break-words'>
										{item.name}
									</Typography>

									<div className='flex items-center justify-between gap-4'>
										<Typography variant='overline' className='line-clamp-1 flex gap-2 font-medium break-words'>
											{item.quantity} x ${formatPrice(item.price)} ={' '}
											<strong>${formatPrice(item.quantity * item.price)}</strong>
										</Typography>
									</div>
								</div>

								<div className='flex gap-2'>
									<ActionButton
										variant='secondary'
										size='icon'
										tooltip='Disminuir'
										disabled={item.quantity === 1}
										onClick={() => onUpdateQuantity(item.id, -1)}
										icon={<Icons.minus className='h-4 w-4' />}
									/>

									<ActionButton
										variant='secondary'
										size='icon'
										tooltip='Aumentar'
										onClick={() => onUpdateQuantity(item.id, 1)}
										icon={<Icons.plus className='h-4 w-4' />}
									/>

									<ActionButton
										variant='secondary'
										size='icon'
										tooltip='Remover'
										className='bg-destructive/20 text-destructive hover:bg-destructive/30'
										onClick={() => onRemoveItem(item.id)}
										icon={<Icons.trash className='h-4 w-4' />}
									/>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		</motion.div>
	)
}
