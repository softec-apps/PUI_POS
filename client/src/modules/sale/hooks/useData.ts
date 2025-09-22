import { useMemo } from 'react'
import { useSale, UseSaleParams } from '@/common/hooks/useSale'
import { PaymentMethod } from '@/common/enums/sale.enum'

export const useSaleData = (params: UseSaleParams) => {
	const saleHook = useSale(params)

	const data = useMemo(() => {
		const items = saleHook.recordsData?.data?.items || []
		const pagination = saleHook.recordsData?.data?.pagination

		const stats = {
			totalRecords: items.length,
			cashMethodRecords: 0,
			cardMethodRecords: 0,
			digitalMethodRecords: 0,
			totalAmount: 0,
		}

		items.forEach(item => {
			switch (item.paymentMethods) {
				case PaymentMethod.CASH:
					stats.cashMethodRecords++
					break
				case PaymentMethod.CARD:
					stats.cardMethodRecords++
					break
				case PaymentMethod.DIGITAL:
					stats.digitalMethodRecords++
					break
			}

			stats.totalAmount += Number(item.total) || 0
		})

		return {
			items,
			pagination,
			isEmpty: pagination?.totalRecords === 0,
			hasError: !!saleHook.error,
			generalStats: stats,
		}
	}, [saleHook.recordsData, saleHook.error])

	return {
		...saleHook,
		data,
	}
}
