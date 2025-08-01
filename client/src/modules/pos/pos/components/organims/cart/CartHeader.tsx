'use client'

import { ArrowLeft } from 'lucide-react'
import { Typography } from '@/components/ui/typography'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { CartState } from '@/common/stores/useCheckoutStore'

interface CartHeaderProps {
	cartState: CartState
	totalItems: number
	onBackToCart: () => void
}

export const CartHeader: React.FC<CartHeaderProps> = ({ cartState, totalItems, onBackToCart }) => (
	<div className='flex flex-shrink-0 items-center justify-between'>
		{cartState === 'checkout' && (
			<ActionButton
				variant='secondary'
				size='lg'
				icon={<ArrowLeft className='h-4 w-4' />}
				onClick={onBackToCart}
				tooltip='Volver al carrito'
			/>
		)}
		<Typography variant='lead'>{cartState === 'cart' ? `Carrito (${totalItems})` : ''}</Typography>
	</div>
)
