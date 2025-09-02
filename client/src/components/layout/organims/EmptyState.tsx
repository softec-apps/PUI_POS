'use client'

import { Icons } from '@/components/icons'
import { UtilBanner } from '@/components/UtilBanner'
import { Card, CardContent } from '@/components/ui/card'

export const EmptyState = () => (
	<Card className='dark:bg-popover bg-muted border-none shadow-none'>
		<CardContent className='py-16'>
			<UtilBanner
				icon={<Icons.search className='h-10 w-10' />}
				title='Ups... no encontramos nada'
				description='Por ahora no hay registros que coincidan. ¿Quieres buscar algo distinto?'
			/>
		</CardContent>
	</Card>
)
