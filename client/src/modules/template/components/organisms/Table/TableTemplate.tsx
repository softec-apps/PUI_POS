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

import { I_Template } from '@/common/types/modules/template'
import { EmptyState } from '@/components/layout/organims/EmptyState'
import { animations } from '@/modules/template/components/atoms/animations'
import { CardView } from '@/modules/template/components/organisms/ViewCard'
import { ListView } from '@/modules/template/components/organisms/ViewList'
import { TableView } from '@/modules/template/components/organisms/ViewTable'
import { ViewType } from '@/modules/template/components/molecules/ViewSelector'
import { LoadingStates } from '@/modules/template/components/organisms/Table/StateLoading'
import { tableColumns } from '@/modules/template/components/organisms/Table/TableColumns'

interface Props {
	loading: boolean
	recordData: I_Template[]
	viewType: ViewType
	onEdit: (recordData: I_Template) => void
	onHardDelete: (recordData: I_Template) => void
}

export function TemplateTable({ recordData, loading, viewType, onEdit, onHardDelete }: Props) {
	const [globalFilter, setGlobalFilter] = useState('')
	const [sorting, setSorting] = useState<SortingState>([])
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

	const columns = tableColumns({ onEdit, onHardDelete })

	const table = useReactTable({
		data: recordData,
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
	if (recordData?.length === 0) return <EmptyState />

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
