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
import { I_Supplier } from '@/common/types/modules/supplier'
import { animations } from '@/modules/supplier/components/atoms/animations'

import { EmptyState } from '@/components/layout/organims/EmptyState'
import { CardView } from '@/modules/supplier/components/organisms/ViewCard'
import { ListView } from '@/modules/supplier/components/organisms/ViewList'
import { TableView } from '@/modules/supplier/components/organisms/ViewTable'
import { ViewType } from '@/modules/supplier/components/molecules/ViewSelector'
import { LoadingStates } from '@/modules/supplier/components/organisms/Table/StateLoading'
import { createTableColumns } from '@/modules/supplier/components/organisms/Table/TableColumns'

interface Props {
	loading: boolean
	recordsData: I_Supplier[]
	viewType: ViewType
	onEdit: (recordsData: I_Supplier) => void
	onHardDelete: (recordsData: I_Supplier) => void
}

export function TableSupplier({ recordsData, loading, viewType, onEdit, onHardDelete }: Props) {
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
				className='h-full'
				layout>
				<motion.div variants={animations.container} className='h-full' layout>
					{viewType === 'table' && <TableView recordsData={table} />}
					{viewType === 'card' && <CardView recordsData={table} onEdit={onEdit} onHardDelete={onHardDelete} />}
					{viewType === 'list' && <ListView recordsData={table} onEdit={onEdit} onHardDelete={onHardDelete} />}
				</motion.div>
			</motion.div>
		</AnimatePresence>
	)
}

export type { ViewType }
