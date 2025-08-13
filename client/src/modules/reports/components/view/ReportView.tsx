'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'

import { useReport } from '@/common/hooks/useReport'
import { usePagination } from '@/modules/reports/hooks/usePagination' // I will create this hook
import { useGenericRefresh } from '@/common/hooks/shared/useGenericRefresh'

import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { UtilBanner } from '@/components/UtilBanner'
import { useDebounce } from '@/common/hooks/useDebounce'
import { PaginationControls } from '@/components/layout/organims/Pagination'
import { ReportFilters } from '@/modules/reports/components/templates/Filters'
import { ReportTable } from '@/modules/reports/components/organisms/Table/ReportTable'
import { ReportChart } from '@/modules/reports/components/organisms/Chart/ReportChart'
import { FatalErrorState, RetryErrorState } from '@/components/layout/organims/ErrorStateCard'

export function ReportView() {
	const [retryCount, setRetryCount] = useState(0)

	const [localSearchTerm, setLocalSearchTerm] = useState<string>('')
	const debouncedSearchTerm = useDebounce(localSearchTerm, 500)

	const {
		pagination,
		currentSort,
		handleNextPage,
		handlePrevPage,
		handleLimitChange,
		handleSort,
		handleResetAll,
		handlePageChange,
		setPagination,
	} = usePagination()

	useEffect(() => {
		setPagination(prev => ({
			...prev,
			search: debouncedSearchTerm,
			page: 1,
		}))
	}, [debouncedSearchTerm, setPagination])

	const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setLocalSearchTerm(value)
	}, [])

	const handleResetAllWithSearch = useCallback(() => {
		setLocalSearchTerm('')
		handleResetAll()
	}, [handleResetAll])

	const paginationParams = useMemo(
		() => ({
			search: debouncedSearchTerm,
			page: pagination.page,
			limit: pagination.limit,
			sort: currentSort ? [currentSort] : undefined,
		}),
		[pagination.page, pagination.limit, debouncedSearchTerm, currentSort]
	)

	const {
		reports,
		loading,
		error: errorReport,
		refetchReports,
	} = useReport(paginationParams)

	const handleRetry = useCallback(() => {
		setRetryCount(prev => prev + 1)
		refetchReports()
	}, [refetchReports])

	const { isRefreshing, handleRefresh } = useGenericRefresh(refetchReports)

	const handleNext = useCallback(() => {
		handleNextPage(reports?.data?.pagination?.hasNextPage)
	}, [handleNextPage, reports?.data?.pagination?.hasNextPage])

	const reportData = useMemo(
		() => ({
			items: reports?.data?.items || [],
			pagination: reports?.data?.pagination,
			hasNextPage: reports?.data?.pagination?.hasNextPage,
		}),
		[reports?.data]
	)

	if (errorReport && retryCount < 3) return <RetryErrorState onRetry={handleRetry} />

	if (errorReport)
		return (
			<Card className='flex h-screen w-full flex-col items-center justify-center gap-4 border-none bg-transparent shadow-none'>
				<FatalErrorState />
			</Card>
		)

	return (
		<div className='flex flex-1 flex-col space-y-6'>
			{reportData?.pagination?.totalRecords === 0 ? (
				<Card className='flex h-screen items-center justify-center border-none bg-transparent shadow-none'>
					<UtilBanner
						icon={<Icons.dataBase />}
						title='Sin registros'
						description='No hay datos disponibles para el reporte'
					/>
				</Card>
			) : (
				<>
                    <ReportChart data={reportData.items} />
					<ReportFilters
						searchValue={localSearchTerm}
						currentSort={currentSort}
						isRefreshing={isRefreshing}
						onSearchChange={handleSearchChange}
						onSort={handleSort}
						onRefresh={handleRefresh}
						onResetAll={handleResetAllWithSearch}
                        onDateChange={() => {}}
					/>

					<ReportTable
						reportData={reportData.items}
						loading={loading}
					/>

					<PaginationControls
						loading={loading}
						pagination={pagination}
						onPrevPage={handlePrevPage}
						onPageChange={handlePageChange}
						onNextPage={handleNext}
						onLimitChange={handleLimitChange}
						metaDataPagination={reports?.data?.pagination}
					/>
				</>
			)}
		</div>
	)
}
