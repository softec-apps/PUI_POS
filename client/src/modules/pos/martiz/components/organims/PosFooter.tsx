'use client'

import { motion } from 'framer-motion'
import { Icons } from '@/components/icons'
import { Separator } from '@radix-ui/react-select'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

interface OrderItem {
	id: string
	name: string
	price: number
	quantity: number
}

export const PosFooter: React.FC<{
	orderItems: OrderItem[]
	total: number
	onToggleCart: () => void
}> = ({ orderItems, total, onToggleCart }) => {
	return (
		<motion.footer
			initial={{ y: 50, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			className='bg-background mt-auto flex items-center justify-between border-t p-3 lg:p-4'>
			<div className='flex items-center gap-2 lg:gap-4'>
				<ActionButton
					icon={<Icons.shoppingCart className='h-3 w-3 lg:h-4 lg:w-4' />}
					variant='outline'
					onClick={onToggleCart}
					text={
						<>
							<span>{orderItems.length} productos</span>
							{orderItems.length > 0 && (
								<span className='bg-secondary text-secondary-foreground ml-2 inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium'>
									{orderItems.reduce((sum, item) => sum + item.quantity, 0)}
								</span>
							)}
						</>
					}
				/>

				<Separator orientation='vertical' className='h-3 lg:h-4' />

				<span className='text-sm font-semibold lg:text-base'>Total: ${total.toFixed(2)}</span>
			</div>
			<div className='text-muted-foreground text-xs'>PUI POS v2.0</div>
		</motion.footer>
	)
}
