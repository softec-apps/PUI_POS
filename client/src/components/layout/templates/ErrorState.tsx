'use client'

import { Card } from '@/components/ui/card'
import { FatalErrorState, RetryErrorState } from '@/components/layout/organims/ErrorStateCard'

interface ErrorStateProps {
	type: 'retry' | 'fatal'
	onRetry?: () => void
}

export const ErrorState = ({ type, onRetry }: ErrorStateProps) => (
	<Card className='flex h-screen w-full flex-col items-center justify-center gap-4 border-none bg-transparent shadow-none'>
		{type === 'retry' && onRetry ? <RetryErrorState onRetry={onRetry} /> : <FatalErrorState />}
	</Card>
)
