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

import { animations } from '@/modules/category/components/atoms/animations'

import { I_Category } from '@/common/types/modules/category'
import { EmptyState } from '@/components/layout/organims/EmptyState'
import { CardView } from '@/modules/category/components/organisms/ViewCard'
import { ListView } from '@/modules/category/components/organisms/ViewList'
import { TableView } from '@/modules/category/components/organisms/ViewTable'
import { ViewType } from '@/components/layout/organims/ViewSelector'
import { LoadingStates } from '@/modules/category/components/organisms/Table/StateLoading'
import { createTableColumns } from '@/modules/category/components/organisms/Table/TableColumns'

interface Props {
	loading: boolean
	categoryData: I_Category[]
	viewType: ViewType
	onEdit: (categoryData: I_Category) => void
	onHardDelete: (categoryData: I_Category) => void
}

export function CategoryTable({ categoryData, loading, viewType, onEdit, onHardDelete }: Props) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
	const [globalFilter, setGlobalFilter] = useState('')

	const columns = createTableColumns({ onEdit, onHardDelete })

	const table = useReactTable({
		data: categoryData,
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
	if (categoryData?.length === 0) return <EmptyState />

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
					{viewType === 'table' && <TableView table={table} />}
					{viewType === 'card' && <CardView table={table} onEdit={onEdit} onHardDelete={onHardDelete} />}
					{viewType === 'list' && <ListView table={table} onEdit={onEdit} onHardDelete={onHardDelete} />}
				</motion.div>
			</motion.div>
		</AnimatePresence>
	)
}

export type { ViewType }
