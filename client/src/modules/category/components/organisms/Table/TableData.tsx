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

import { I_Category } from '@/common/types/modules/category'

import { EmptyState } from '@/components/layout/organims/EmptyState'
import { ViewType } from '@/components/layout/organims/ViewSelector'
import { CardView } from '@/modules/category/components/templates/ViewCard'
import { ListView } from '@/modules/category/components/templates/ViewList'
import { TableView } from '@/modules/category/components/templates/ViewTable'
import { LoadingStates } from '@/modules/category/components/templates/ViewSkeleton'
import { createTableColumns } from '@/modules/category/components/organisms/Table/TableColumns'

interface TableProps {
	loading: boolean
	recordsData: I_Category[]
	viewType: ViewType
	onEdit: (recordsData: I_Category) => void
	onSoftDelete: (recordsData: I_Category) => void
	onHardDelete: (recordsData: I_Category) => void
	onRestore: (recordsData: I_Category) => void
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
	onSoftDelete,
	onHardDelete,
	onRestore,
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
	const columns = useMemo(
		() => createTableColumns({ onEdit, onSoftDelete, onHardDelete, onRestore }),
		[onEdit, onSoftDelete, onHardDelete, onRestore]
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

	// Optimized handlers with useCallback
	const handleEdit = useCallback((user: I_Category) => onEdit(user), [onEdit])
	const handleSoftDelete = useCallback((user: I_Category) => onSoftDelete(user), [onSoftDelete])
	const handleHardDelete = useCallback((user: I_Category) => onHardDelete(user), [onHardDelete])
	const handleRestore = useCallback((user: I_Category) => onRestore(user), [onRestore])

	if (loading) return <LoadingStates viewType={viewType} />
	if (!recordsData || recordsData.length === 0) return <EmptyState />

	// Render view component based on viewType
	const renderView = () => {
		const viewProps = {
			recordsData: table,
			onEdit: handleEdit,
			onSoftDelete: handleSoftDelete,
			onHardDelete: handleHardDelete,
			onHandleRestore: handleRestore,
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
