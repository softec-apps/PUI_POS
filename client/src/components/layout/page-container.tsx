'use client'

import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface PageContainerProps {
	children: React.ReactNode
	scrollable?: boolean
}

export default function PageContainer({ children, scrollable = true }: PageContainerProps) {
	if (scrollable) {
		return (
			<div className='h-[calc(100dvh-52px)] overflow-hidden'>
				<ScrollArea className='h-full'>
					<div className='px-4 py-3 pb-12'>{children}</div>
				</ScrollArea>
			</div>
		)
	}

	return <div className='min-h-[calc(100dvh-52px)] p-4'>{children}</div>
}
