'use client'

import { useKardex } from '@/common/hooks/useKardex'
import { Card, CardContent } from '@/components/ui/card'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import { Typography } from '@/components/ui/typography'
import { FatalErrorState } from '@/components/layout/organims/ErrorStateCard'
import { NotFoundState } from '@/components/layout/organims/NotFoundState'
import { formatDate } from '@/common/utils/dateFormater-util'
import { TableKardex } from '../organisms/Table/TableKardex'
import { KardexHeader } from '../templates/Header'

type Props = {
	id: string
}

export function KardexDetailView({ id }: Props) {
	const {
		records: movementsKardex,
		loading: movementsLoading,
		error: movementsError,
	} = useKardex({
		filters: {
			productId: id,
		},
	})

	if (movementsLoading) {
		return (
			<div className='flex h-screen flex-1 flex-col items-center justify-center'>
				<SpinnerLoader text='Cargando... Por favor espera' />
			</div>
		)
	}

	if (movementsError) {
		return (
			<div className='flex flex-1 flex-col items-center justify-center space-y-6'>
				<FatalErrorState />
			</div>
		)
	}

	if (!movementsKardex?.data?.items || movementsKardex?.data?.items.length === 0) {
		return (
			<div className='flex h-screen flex-1 flex-col items-center justify-center'>
				<NotFoundState />
			</div>
		)
	}

	return (
		<div className='flex flex-1 flex-col space-y-6'>
			<KardexHeader
				title={`${movementsKardex.data.items[0].product.name}`}
				subtitle='Detalle de movimientos de Kardex'
			/>

			{/* Table */}
			<TableKardex recordData={movementsKardex.data.items} loading={movementsLoading} viewType='table' />
		</div>
	)
}
