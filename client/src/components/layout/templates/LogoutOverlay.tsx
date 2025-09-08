'use client'

import { SpinnerLoader } from '@/components/layout/SpinnerLoader'

interface LogoutOverlayProps {
	isLoading: boolean
}

export function LogoutOverlay({ isLoading }: LogoutOverlayProps) {
	if (!isLoading) return null

	return (
		<div className='bg-popover fixed inset-0 z-50 flex items-center justify-center'>
			<SpinnerLoader text='Cerrando sesión...' />
		</div>
	)
}
