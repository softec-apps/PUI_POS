'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { I_Sale } from '@/common/types/modules/sale'
import { Table as ReactTable, flexRender } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface TableViewProps {
	table: ReactTable<I_Sale>
}

export const TableView = ({ table }: TableViewProps) => {
	return (
		<motion.div>
			<Table className='border-t border-b'>
				<TableHeader className='bg-accent dark:bg-accent/30'>
					{table.getHeaderGroups().map(headerGroup => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map(header => (
								<TableHead key={header.id} className='text-muted-foreground'>
									{flexRender(header.column.columnDef.header, header.getContext())}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>

				<TableBody className='divide-y'>
					<AnimatePresence mode='sync'>
						{table.getRowModel().rows.map(row => (
							<motion.tr
								key={row.id}
								layout='position'
								className='group'>
								{row.getVisibleCells().map(cell => (
									<TableCell key={cell.id} className='text-primary'>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</motion.tr>
						))}
					</AnimatePresence>
				</TableBody>
			</Table>
		</motion.div>
	)
}
