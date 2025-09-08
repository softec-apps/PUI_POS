'use client'

import { Icons } from '@/components/icons'
import { useLogout } from '@/common/hooks/use-logout'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { LogoutOverlay } from '@/components/layout/templates/LogoutOverlay'

export function LogoutButton() {
	const { isLoading, handleLogout } = useLogout()

	return (
		<>
			<ActionButton
				onClick={handleLogout}
				variant='secondary'
				icon={isLoading ? <Icons.spinnerSimple className='animate-spin' /> : <Icons.logout />}
				size='icon'
				tooltip={isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
				disabled={isLoading}
				className='hover:bg-destructive/70'
			/>

			<LogoutOverlay isLoading={isLoading} />
		</>
	)
}
