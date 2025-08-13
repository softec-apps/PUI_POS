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

import { I_Sale } from '@/common/types/modules/sale'
import { EmptyState } from '@/components/layout/organims/EmptyState'
import { TableView } from './ViewTable' // This will be a simplified version of the category one
import { LoadingStates } from './StateLoading' // This will be a simplified version of the category one
import { createTableColumns } from './TableColumns'

interface Props {
	loading: boolean
	saleData: I_Sale[]
	onEdit: (saleData: I_Sale) => void
	onHardDelete: (saleData: I_Sale) => void
}

export function SalesTable({ saleData, loading, onEdit, onHardDelete }: Props) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
	const [globalFilter, setGlobalFilter] = useState('')

	const columns = createTableColumns({ onEdit, onHardDelete })

	const table = useReactTable({
		data: saleData,
		columns,
		state: {
			sorting,
			rowSelection,
			globalFilter,
		},
		getRowId: row => row.id,
		onSortingChange: setSorting,
		onRowSelectionChange: setRowSelection,
		onGlobalFilterChange: setGlobalFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
	})

	if (loading) return <LoadingStates />
	if (saleData?.length === 0) return <EmptyState />

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
