'use client'

import {
	SortingState,
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	RowSelectionState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { I_ReportItem } from '@/common/types/modules/report'
import { EmptyState } from '@/components/layout/organims/EmptyState'
import { TableView } from './ViewTable'
import { LoadingStates } from './StateLoading'
import { createTableColumns } from './TableColumns'

interface Props {
	loading: boolean
	reportData: I_ReportItem[]
}

export function ReportTable({ reportData, loading }: Props) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
	const [globalFilter, setGlobalFilter] = useState('')

	const columns = createTableColumns()

	const table = useReactTable({
		data: reportData,
		columns,
		state: {
			sorting,
			rowSelection,
			globalFilter,
		},
		onSortingChange: setSorting,
		onRowSelectionChange: setRowSelection,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	})

	if (loading) return <LoadingStates />
	if (reportData?.length === 0) return <EmptyState />

	return (
		<AnimatePresence mode='popLayout' initial={false}>
			<motion.div
				key='table'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				layout>
				<motion.div layout>
					<TableView table={table} />
				</motion.div>
			</motion.div>
		</AnimatePresence>
	)
}
