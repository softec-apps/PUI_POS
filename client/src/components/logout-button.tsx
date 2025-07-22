'use client'

import { Button } from './ui/button'
import { signOut } from 'next-auth/react'
import { ROUTE_PATH } from '@/common/constants/routes-const'

export function LogoutButton() {
	const handleLogout = () => {
		signOut({
			callbackUrl: `${ROUTE_PATH.AUTH.SIGNIN}`,
		})
	}

	return (
		<Button onClick={handleLogout} variant='secondary' size='xs'>
			Sign out
		</Button>
	)
}
