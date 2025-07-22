'use client'

import { Icons } from '@/components/icons'
import { UtilBanner } from '@/components/UtilBanner'
import { Card, CardContent } from '@/components/ui/card'

export const EmptyState = () => (
	<Card className='dark:bg-accent/20 bg-accent/40 border-none shadow-none'>
		<CardContent className='py-16'>
			<UtilBanner
				icon={<Icons.archive className='h-10 w-10' />}
				title='Lo sentimos, cero coincidencias'
				description='No hay registros disponibles actualmente. ¿Quieres probar otra cosa?'
			/>
		</CardContent>
	</Card>
)
