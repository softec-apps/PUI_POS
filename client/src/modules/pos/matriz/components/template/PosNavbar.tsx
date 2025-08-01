'use client'

import { LogoutButton } from '@/components/logout-button'
import { UserAvatarProfile } from '@/components/user-avatar-profile'
import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle'

export const NavbarPOSMatriz = () => {
	return (
		<header className='flex h-14 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14'>
			<div className='flex items-center gap-2'>NAV</div>

			<div className='flex items-center gap-2'>
				<ModeToggle />
				<LogoutButton />
				<UserAvatarProfile showInfo={true} />
			</div>
		</header>
	)
}
