'use client'

import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { UtilBanner } from '@/components/UtilBanner'

export const EmptyState = () => (
	<div className='flex flex-1 flex-col space-y-6'>
		<Card className='flex h-screen items-center justify-center border-none bg-transparent shadow-none'>
			<div className='flex flex-col items-center gap-4'>
				<UtilBanner
					icon={<Icons.dataBase />}
					title='Sin registros'
					description='No hay datos disponibles. Intentá crear una venta primero'
				/>
			</div>
		</Card>
	</div>
)
