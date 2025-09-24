'use client'
import {
	SortingState,
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	RowSelectionState,
	getFilteredRowModel,
} from '@tanstack/react-table'
import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { animations } from '@/lib/animations'
import { I_Sale } from '@/common/types/modules/sale'
import { EmptyState } from '@/components/layout/organims/EmptyState'
import { ViewType } from '@/components/layout/organims/ViewSelector'
import { CardView } from '@/modules/sale/components/templates/ViewCard'
import { ListView } from '@/modules/sale/components/templates/ViewList'
import { TableView } from '@/modules/sale/components/templates/ViewTable'
import { LoadingStates } from '@/modules/sale/components/templates/ViewSkeleton'
import { createTableColumns } from '@/modules/sale/components/organisms/Table/TableColumns'
import { Table } from '@/components/ui/table'

interface TableProps {
	loading: boolean
	recordsData: I_Sale[]
	viewType: ViewType
	onViewBill: (recordsData: I_Sale) => void // Fixed: corrected the prop name
	onViewVoucher: (recordsData: I_Sale) => void
	// Optional props for enhanced functionality
	enableGlobalFilter?: boolean
	enableRowSelection?: boolean
	defaultSorting?: SortingState
	className?: string
}

export function TableData({
	recordsData,
	loading,
	viewType,
	onViewBill,
	enableGlobalFilter = true,
	enableRowSelection = true,
	defaultSorting = [],
	className,
}: TableProps) {
	// State management
	const [sorting, setSorting] = useState<SortingState>(defaultSorting)
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
	const [globalFilter, setGlobalFilter] = useState('')

	// Memoized columns to prevent unnecessary re-renders
	const columns = useMemo(() => createTableColumns({ onViewBill }), [onViewBill])

	// Memoized table configuration
	const table = useReactTable({
		data: recordsData,
		columns,
		state: {
			sorting,
			...(enableRowSelection && { rowSelection }),
			...(enableGlobalFilter && { globalFilter }),
		},
		getRowId: row => row.id,
		onSortingChange: setSorting,
		...(enableRowSelection && { onRowSelectionChange: setRowSelection }),
		...(enableGlobalFilter && { onGlobalFilterChange: setGlobalFilter }),
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		...(enableGlobalFilter && { getFilteredRowModel: getFilteredRowModel() }),
		// Performance optimizations
		enableGlobalFilter,
		enableRowSelection,
		autoResetPageIndex: false,
		autoResetExpanded: false,
	})

	const handleViewBill = useCallback((recordData: I_Sale) => onViewBill(recordData), [onViewBill])

	if (loading) return <LoadingStates viewType={viewType} />
	if (!recordsData || recordsData.length === 0) return <EmptyState />

	// Render view component based on viewType
	const renderView = () => {
		const viewProps = {
			recordsData: table,
			handleViewBill,
		}

		switch (viewType) {
			case 'table':
				return (
					<Table className='w-full table-fixed overflow-hidden'>
						<TableView {...viewProps} />
					</Table>
				)
			case 'card':
				return <CardView {...viewProps} />
			case 'list':
				return <ListView {...viewProps} />
			default:
				return <TableView {...viewProps} />
		}
	}

	return (
		<div className={className}>
			<AnimatePresence mode='popLayout' initial={false}>
				<motion.div
					key={`${viewType}-${recordsData.length}`}
					initial='initial'
					animate='animate'
					exit='exit'
					layout
					className='w-full'>
					<motion.div variants={animations.container} layout className='relative'>
						{renderView()}
					</motion.div>
				</motion.div>
			</AnimatePresence>
		</div>
	)
}
