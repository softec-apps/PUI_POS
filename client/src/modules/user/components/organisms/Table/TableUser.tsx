'use client'

import {
	SortingState,
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	RowSelectionState,
} from '@tanstack/react-table'
import { useState } from 'react'
import { I_User } from '@/common/types/modules/user'
import { motion, AnimatePresence } from 'framer-motion'
import { animations } from '@/modules/user/components/atoms/animations'

import { EmptyState } from '@/components/layout/organims/EmptyState'
import { CardView } from '@/modules/user/components/organisms/ViewCard'
import { ListView } from '@/modules/user/components/organisms/ViewList'
import { TableView } from '@/modules/user/components/organisms/ViewTable'
import { ViewType } from '@/modules/user/components/molecules/ViewSelector'
import { LoadingStates } from '@/modules/user/components/organisms/Table/StateLoading'
import { createTableColumns } from '@/modules/user/components/organisms/Table/TableColumns'

interface TableUserProps {
	loading: boolean
	recordsData: I_User[]
	viewType: ViewType
	onEdit: (recordsData: I_User) => void
	onSoftDelete: (recordsData: I_User) => void
	onHardDelete: (recordsData: I_User) => void
}

export function TableUser({ recordsData, loading, viewType, onEdit, onSoftDelete, onHardDelete }: TableUserProps) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
	const [globalFilter, setGlobalFilter] = useState('')

	const columns = createTableColumns({ onEdit, onSoftDelete, onHardDelete })

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
