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

import { I_Customer } from '@/common/types/modules/customer'

import { EmptyState } from '@/components/layout/organims/EmptyState'
import { ViewType } from '@/components/layout/organims/ViewSelector'
import { CardView } from '@/modules/customer/components/templates/ViewCard'
import { ListView } from '@/modules/customer/components/templates/ViewList'
import { TableView } from '@/modules/customer/components/templates/ViewTable'
import { LoadingStates } from '@/modules/customer/components/templates/ViewSkeleton'
import { createTableColumns } from '@/modules/customer/components/organisms/Table/TableColumns'

interface TableProps {
	loading: boolean
	recordsData: I_Customer[]
	viewType: ViewType
	onEdit: (recordsData: I_Customer) => void
	onSoftDelete: (recordsData: I_Customer) => void
	onHardDelete: (recordsData: I_Customer) => void
	onRestore: (recordsData: I_Customer) => void
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
	onEdit,
	onHardDelete,
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
	const columns = useMemo(() => createTableColumns({ onEdit, onHardDelete }), [onEdit, onHardDelete])

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

	// Optimized handlers with useCallback
	const handleEdit = useCallback((user: I_Customer) => onEdit(user), [onEdit])
	const handleHardDelete = useCallback((user: I_Customer) => onHardDelete(user), [onHardDelete])

	if (loading) return <LoadingStates viewType={viewType} />
	if (!recordsData || recordsData.length === 0) return <EmptyState />

	// Render view component based on viewType
	const renderView = () => {
		const viewProps = {
			recordsData: table,
			onEdit: handleEdit,
			onHardDelete: handleHardDelete,
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
