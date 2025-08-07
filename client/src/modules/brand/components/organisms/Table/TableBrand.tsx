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

import { animations } from '@/modules/brand/components/atoms/animations'

import { I_Brand } from '@/common/types/modules/brand'
import { EmptyState } from '@/components/layout/organims/EmptyState'
import { CardView } from '@/modules/brand/components/organisms/ViewCard'
import { ListView } from '@/modules/brand/components/organisms/ViewList'
import { TableView } from '@/modules/brand/components/organisms/ViewTable'
import { ViewType } from '@/modules/brand/components/molecules/ViewSelector'
import { LoadingStates } from '@/modules/brand/components/organisms/Table/StateLoading'
import { createTableColumns } from '@/modules/brand/components/organisms/Table/TableColumns'

interface Props {
	loading: boolean
	brandData: I_Brand[]
	viewType: ViewType
	onEdit: (brandData: I_Brand) => void
	onHardDelete: (brandData: I_Brand) => void
}

export function BrandTable({ brandData, loading, viewType, onEdit, onHardDelete }: Props) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
	const [globalFilter, setGlobalFilter] = useState('')

	const columns = createTableColumns({ onEdit, onHardDelete })

	const table = useReactTable({
		data: brandData,
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
	if (brandData?.length === 0) return <EmptyState />

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
					{viewType === 'table' && <TableView table={table} />}
					{viewType === 'card' && <CardView table={table} onEdit={onEdit} onHardDelete={onHardDelete} />}
					{viewType === 'list' && <ListView table={table} onEdit={onEdit} onHardDelete={onHardDelete} />}
				</motion.div>
			</motion.div>
		</AnimatePresence>
	)
}

export type { ViewType }
