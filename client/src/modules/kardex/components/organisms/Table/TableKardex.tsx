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

import { I_Kardex } from '@/modules/kardex/types/kardex'
import { EmptyState } from '@/components/layout/organims/EmptyState'
import { animations } from '@/modules/kardex/components/atoms/animations'
import { CardView } from '@/modules/kardex/components/organisms/ViewCard'
import { ListView } from '@/modules/kardex/components/organisms/ViewList'
import { TableView } from '@/modules/kardex/components/organisms/ViewTable'
import { ViewType } from '@/modules/kardex/components/molecules/ViewSelector'
import { LoadingStates } from '@/modules/kardex/components/organisms/Table/StateLoading'
import { tableColumns } from '@/modules/kardex/components/organisms/Table/TableColumns'

interface TableKardexProps {
	loading: boolean
	recordData: I_Kardex[]
	viewType: ViewType
}

export function TableKardex({ recordData, loading, viewType }: TableKardexProps) {
	const [globalFilter, setGlobalFilter] = useState('')
	const [sorting, setSorting] = useState<SortingState>([])
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

	const columns = tableColumns({})

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
					{viewType === 'card' && <CardView table={table} />}
					{viewType === 'list' && <ListView table={table} />}
				</motion.div>
			</motion.div>
		</AnimatePresence>
	)
}

export type { ViewType }
