'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const HEADERS = ['Imagen', 'Nombre', 'Precio base', 'Código', 'Código barras', 'Stock', 'Estado', 'Información', '']

interface Props {
	rows?: number
}

export const TableSkeleton = ({ rows = 7 }: Props) => {
	return (
		<Table className='w-full'>
			<TableHeader>
				<TableRow className='hover:bg-transparent'>
					{HEADERS.map((header, index) => (
						<TableHead key={index} className='text-muted-foreground w-auto'>
							{header}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>

			<TableBody>
				{Array.from({ length: rows }).map((_, rowIndex) => (
					<TableRow key={rowIndex}>
						{HEADERS.map((_, cellIndex) => (
							<TableCell key={cellIndex}>
								<Skeleton
									className={`${cellIndex === HEADERS.length - 1 ? 'h-6 w-auto rounded' : cellIndex === 4 ? 'h-6 w-auto' : 'h-6 w-auto'}`}
								/>
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
}
