'use client'

import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function PageContainer({
	children,
	scrollable = true,
}: {
	children: React.ReactNode
	scrollable?: boolean
}) {
	return (
		<>
			{scrollable ? (
				<ScrollArea className='h-[calc(100dvh-52px)]'>
					<div className='mb-7 flex flex-1 p-4'>{children}</div>
				</ScrollArea>
			) : (
				<div className='flex flex-1 p-4'>{children}</div>
			)}
		</>
	)
}
