'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export const TableSkeleton = () => (
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                <TableHead><Skeleton className="h-4 w-32" /></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
)


export const LoadingStates = () => {
	return (
		<Card className='p-0 shadow-none'>
			<TableSkeleton />
		</Card>
	)
}
