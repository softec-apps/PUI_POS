'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { ViewType } from '@/components/layout/organims/ViewSelector'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

/* ---------------------------
 * Table Skeleton
 * --------------------------- */
const HEADERS = ['Nombre', 'Descripción', 'Estado', 'Información', '']

interface TableSkeletonProps {
	rows?: number
}

export const TableSkeleton = ({ rows = 7 }: TableSkeletonProps) => (
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
							<Skeleton className='h-6 w-auto' />
						</TableCell>
					))}
				</TableRow>
			))}
		</TableBody>
	</Table>
)

/* ---------------------------
 * Card Skeleton
 * --------------------------- */
interface CardSkeletonProps {
	count?: number
}

export const CardSkeleton = ({ count = 8 }: CardSkeletonProps) => (
	<div className='space-y-4'>
		<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
			{Array.from({ length: count }).map((_, i) => (
				<Card key={i} className='animate-pulse overflow-hidden p-0'>
					<div className='bg-muted h-48'></div>
					<CardContent className='pb-4'>
						<div className='space-y-3'>
							<Skeleton className='h-5 w-3/4' />
							<Skeleton className='h-4 w-full' />
							<Skeleton className='h-4 w-2/3' />
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	</div>
)

/* ---------------------------
 * List Skeleton
 * --------------------------- */
interface ListSkeletonProps {
	count?: number
}

export const ListSkeleton = ({ count = 6 }: ListSkeletonProps) => (
	<div className='space-y-4'>
		<div className='flex items-center justify-between'>
			<div className='flex items-center gap-4'>
				<Skeleton className='h-10 w-32' />
				<Skeleton className='h-10 w-24' />
			</div>
		</div>

		<div className='space-y-4'>
			{Array.from({ length: count }).map((_, i) => (
				<Card key={i} className='animate-pulse p-4'>
					<div className='flex items-center space-x-4'>
						<Skeleton className='h-24 w-36 rounded-lg' />
						<div className='flex-1 space-y-2'>
							<Skeleton className='h-5 w-1/4' />
							<Skeleton className='h-4 w-3/4' />
							<Skeleton className='h-4 w-1/2' />
						</div>
						<Skeleton className='h-8 w-8' />
					</div>
				</Card>
			))}
		</div>
	</div>
)

/* ---------------------------
 * Main Unified Loading Component
 * --------------------------- */
interface LoadingStatesProps {
	viewType: ViewType
}
export const LoadingStates = ({ viewType }: LoadingStatesProps) => {
	if (viewType === 'table') return <TableSkeleton />
	if (viewType === 'card') return <CardSkeleton />
	if (viewType === 'list') return <ListSkeleton />
	return null
}
