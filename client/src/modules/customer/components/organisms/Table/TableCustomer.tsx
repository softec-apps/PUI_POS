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

import { animations } from '@/modules/customer/components/atoms/animations'

import { I_Customer } from '@/common/types/modules/customer'
import { EmptyState } from '@/components/layout/organims/EmptyState'
import { CardView } from '@/modules/customer/components/organisms/ViewCard'
import { ListView } from '@/modules/customer/components/organisms/ViewList'
import { TableView } from '@/modules/customer/components/organisms/ViewTable'
import { ViewType } from '@/components/layout/organims/ViewSelector'
import { LoadingStates } from '@/modules/customer/components/organisms/Table/StateLoading'
import { createTableColumns } from '@/modules/customer/components/organisms/Table/TableColumns'

interface TableCustomerProps {
	loading: boolean
	customerData: I_Customer[]
	viewType: ViewType
	onEdit: (customerData: I_Customer) => void
	onHardDelete: (customerData: I_Customer) => void
}

export function TableCustomer({ customerData, loading, viewType, onEdit, onHardDelete }: TableCustomerProps) {
	const [sorting, setSorting] = useState<SortingState>([])
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
	const [globalFilter, setGlobalFilter] = useState('')

	const columns = createTableColumns({ onEdit, onHardDelete })

	const recordsData = useReactTable({
		data: customerData,
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
	if (customerData?.length === 0) return <EmptyState />

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
					{viewType === 'table' && <TableView recordsData={recordsData} />}
					{viewType === 'card' && <CardView table={recordsData} onEdit={onEdit} onHardDelete={onHardDelete} />}
					{viewType === 'list' && <ListView table={recordsData} onEdit={onEdit} onHardDelete={onHardDelete} />}
				</motion.div>
			</motion.div>
		</AnimatePresence>
	)
}

export type { ViewType }
