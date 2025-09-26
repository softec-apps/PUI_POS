'use client'

import {
	SortingState,
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	RowSelectionState,
	getFilteredRowModel,
} from '@tanstack/react-table'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { animations } from '@/lib/animations'

import { I_Kardex } from '@/common/types/modules/kardex'

import { EmptyState } from '@/components/layout/organims/EmptyState'
import { ViewType } from '@/components/layout/organims/ViewSelector'
import { CardView } from '@/modules/kardex/components/templates/ViewCard'
import { ListView } from '@/modules/kardex/components/templates/ViewList'
import { TableView } from '@/modules/kardex/components/templates/ViewTable'
import { LoadingStates } from '@/modules/kardex/components/templates/ViewSkeleton'
import { createTableColumns } from '@/modules/kardex/components/organisms/Table/TableColumns'
import { Table } from '@/components/ui/table'

interface TableProps {
	loading: boolean
	recordsData: I_Kardex[]
	viewType: ViewType
	// Optional props for enhanced functionality
	enableGlobalFilter?: boolean
	enableRowSelection?: boolean
	defaultSorting?: SortingState
	className?: string

	showProductCode?: boolean
	showMovementType?: boolean
	showQuantity?: boolean
	showStock?: boolean
	showUnitCost?: boolean
	showTotal?: boolean
	showInfo?: boolean
	showActions?: boolean
}

export function TableData({
	recordsData,
	loading,
	viewType,
	enableGlobalFilter = true,
	enableRowSelection = true,
	defaultSorting = [],
	className,

	// props nuevas con defaults
	showProductCode = true,
	showMovementType = true,
	showQuantity = true,
	showStock = true,
	showUnitCost = true,
	showTotal = true,
	showInfo = true,
	showActions = true,
}: TableProps) {
	// State management
	const [sorting, setSorting] = useState<SortingState>(defaultSorting)
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
	const [globalFilter, setGlobalFilter] = useState('')

	// Memoized columns to prevent unnecessary re-renders
	const columns = useMemo(
		() =>
			createTableColumns({
				showProductCode,
				showMovementType,
				showQuantity,
				showStock,
				showUnitCost,
				showTotal,
				showInfo,
				showActions,
			}),
		[showProductCode, showMovementType, showQuantity, showStock, showUnitCost, showTotal, showInfo, showActions]
	)

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

	if (loading) return <LoadingStates viewType={viewType} />
	if (!recordsData || recordsData.length === 0) return <EmptyState />

	// Render view component based on viewType
	const renderView = () => {
		const viewProps = {
			recordsData: table,
		}

		switch (viewType) {
			case 'table':
				return <TableView {...viewProps} />
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
