import type { Metadata } from 'next'
import PageContainer from '@/components/layout/page-container'
import { POSMatriz } from '@/modules/pos/martiz/components/view/PosMatriz'

export const metadata: Metadata = {
	title: 'POS - Sistema de Punto de Venta',
	description: 'Vende con PUI POS - Sistema moderno de punto de venta',
}

export default async function PosPage() {
	return (
		<PageContainer>
			<POSMatriz />
		</PageContainer>
	)
}
