'use client'

import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FooterPublic } from './templates/FooterPublic'

interface PageContainerProps {
	children: React.ReactNode
	scrollable?: boolean
}

export default function PageContainer({ children, scrollable = true }: PageContainerProps) {
	if (scrollable) {
		return (
			<div className='flex h-[calc(100dvh-52px)] flex-col'>
				<ScrollArea className='relative h-screen flex-1'>
					<div className='px-4 pb-28'>{children}</div>
				</ScrollArea>

				<div className='sticky right-0 bottom-0 left-0 z-10'>
					<FooterPublic />
				</div>
			</div>
		)
	}

	return (
		<div className='relative min-h-[calc(100dvh-52px)] px-2'>
			<div>{children}</div>
			<div className='sticky right-0 bottom-0 left-0 z-10'>
				<FooterPublic />
			</div>
		</div>
	)
}
