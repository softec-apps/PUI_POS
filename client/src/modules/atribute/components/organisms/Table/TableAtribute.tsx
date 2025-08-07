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

import { I_Attribute } from '@/common/types/modules/attribute'
import { EmptyState } from '@/components/layout/organims/EmptyState'
import { CardView } from '@/modules/atribute/components/organisms/ViewCard'
import { ListView } from '@/modules/atribute/components/organisms/ViewList'
import { animations } from '@/modules/atribute/components/atoms/animations'
import { TableView } from '@/modules/atribute/components/organisms/ViewTable'
import { ViewType } from '@/modules/atribute/components/molecules/ViewSelector'
import { LoadingStates } from '@/modules/atribute/components/organisms/Table/StateLoading'
import { createTableColumns } from '@/modules/atribute/components/organisms/Table/TableColumns'

interface Props {
	loading: boolean
	atributeData: I_Attribute[]
	viewType: ViewType
	onEdit: (atributeData: I_Attribute) => void
	onHardDelete: (atributeData: I_Attribute) => void
}

export function AtributeTable({ atributeData, loading, viewType, onEdit, onHardDelete }: Props) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
	const [globalFilter, setGlobalFilter] = useState('')

	const columns = createTableColumns({ onEdit, onHardDelete })

	const table = useReactTable({
		data: atributeData,
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
	if (atributeData?.length === 0) return <EmptyState />

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
