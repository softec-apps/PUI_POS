'use client'

import { Icons } from '@/components/icons'
import { UtilBanner } from '@/components/UtilBanner'
import { Card, CardContent } from '@/components/ui/card'

export const NotFoundState = () => (
	<Card className='border-none bg-transparent shadow-none'>
		<CardContent>
			<UtilBanner
				icon={<Icons.infoCircle className='h-10 w-10' />}
				title='Recurso no encontrado'
				description='El contenido que buscas no existe o fue movido'
			/>
		</CardContent>
	</Card>
)
