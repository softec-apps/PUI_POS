import { useMemo } from 'react'
import { I_Sale } from '@/common/types/modules/sale'
import { DashboardMetrics } from '@/modules/dashboard/types/dashboard'
import { calculateAdvancedMetrics } from '@/modules/dashboard/utils/metricsUtils'

export const useDashboardMetrics = (sales: I_Sale[], dateRange: string): DashboardMetrics => {
	return useMemo(() => {
		return calculateAdvancedMetrics(sales, dateRange)
	}, [sales, dateRange])
}
