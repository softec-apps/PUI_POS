'use client'

import { I_User } from '@/common/types/modules/user'
import { motion, AnimatePresence } from 'framer-motion'
import { Table as ReactTable, flexRender } from '@tanstack/react-table'
import { animations } from '@/modules/user/components/atoms/animations'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface TableViewProps {
	recordsData: ReactTable<I_User>
}

export const TableView = ({ recordsData }: TableViewProps) => {
	return (
		<motion.div initial='hidden' animate='visible' variants={animations.container}>
			<Table className='border-t border-b'>
				<TableHeader className='bg-accent dark:bg-accent/30'>
					{recordsData.getHeaderGroups().map(headerGroup => (
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
						{recordsData.getRowModel().rows.map(row => (
							<motion.tr
								key={row.id}
								variants={animations.rowItem}
								initial='hidden'
								animate='visible'
								exit='exit'
								whileHover='hover'
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
