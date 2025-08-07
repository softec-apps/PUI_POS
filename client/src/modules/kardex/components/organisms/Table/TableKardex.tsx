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
import { I_Kardex } from '@/common/types/modules/kardex'
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
	showActions?: boolean
	// Props para control de sorting
	sortableColumns?: string[]
	enableSorting?: boolean
	// Props para mostrar/ocultar columnas específicas
	showProductCode?: boolean
	showMovementType?: boolean
	showQuantity?: boolean
	showUnitCost?: boolean
	showSubtotal?: boolean
	showTaxRate?: boolean
	showTaxAmount?: boolean
	showTotal?: boolean
	showStockAfter?: boolean
	showStockBefore?: boolean
	showResponsible?: boolean
	showInfo?: boolean
}

export function TableKardex({
	recordData,
	loading,
	viewType,
	showActions = true,
	// Props de sorting con valores por defecto
	sortableColumns,
	enableSorting = true,
	// Props de columnas con valores por defecto (todas visibles)
	showProductCode = true,
	showMovementType = true,
	showQuantity = true,
	showUnitCost = true,
	showSubtotal = true,
	showTaxRate = true,
	showTaxAmount = true,
	showTotal = true,
	showStockAfter = true,
	showStockBefore = true,
	showResponsible = true,
	showInfo = true,
}: TableKardexProps) {
	const [globalFilter, setGlobalFilter] = useState('')
	const [sorting, setSorting] = useState<SortingState>([])
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

	const columns = tableColumns({
		showActions,
		sortableColumns,
		enableSorting,
		showProductCode,
		showMovementType,
		showQuantity,
		showUnitCost,
		showSubtotal,
		showTaxRate,
		showTaxAmount,
		showTotal,
		showStockAfter,
		showStockBefore,
		showResponsible,
		showInfo,
	})

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
