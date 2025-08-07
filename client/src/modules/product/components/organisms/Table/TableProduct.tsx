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
import { I_Product } from '@/common/types/modules/product'
import { animations } from '@/modules/product/components/atoms/animations'

import { EmptyState } from '@/components/layout/organims/EmptyState'
import { CardView } from '@/modules/product/components/organisms/ViewCard'
import { ListView } from '@/modules/product/components/organisms/ViewList'
import { TableView } from '@/modules/product/components/organisms/ViewTable'
import { ViewType } from '@/modules/product/components/molecules/ViewSelector'
import { LoadingStates } from '@/modules/product/components/organisms/Table/StateLoading'
import { createTableColumns } from '@/modules/product/components/organisms/Table/TableColumns'

interface TableProductProps {
	loading: boolean
	recordsData: I_Product[]
	viewType: ViewType
	onEdit: (recordsData: I_Product) => void
	onHardDelete: (recordsData: I_Product) => void
}

export function TableProduct({ recordsData, loading, viewType, onEdit, onHardDelete }: TableProductProps) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
	const [globalFilter, setGlobalFilter] = useState('')

	const columns = createTableColumns({ onEdit, onHardDelete })

	const table = useReactTable({
		data: recordsData,
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

	if (loading) return <LoadingStates viewType={viewType} />

	if (recordsData?.length === 0) return <EmptyState />

	return (
		<AnimatePresence mode='popLayout' initial={false}>
			<motion.div
				key={viewType}
				initial='initial'
				animate='animate'
				exit='exit'
				variants={animations.viewTransition}
				layout>
				<motion.div variants={animations.container} layout>
					{viewType === 'table' && <TableView recordsData={table} />}
					{viewType === 'card' && <CardView recordsData={table} onEdit={onEdit} onHardDelete={onHardDelete} />}
					{viewType === 'list' && <ListView recordsData={table} onEdit={onEdit} onHardDelete={onHardDelete} />}
				</motion.div>
			</motion.div>
		</AnimatePresence>
	)
}

export type { ViewType }
