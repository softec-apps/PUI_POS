'use client'

import { LogoType } from '@/components/logos/LogoType'
import { LogoutButton } from '@/components/logout-button'
import { UserAvatarProfile } from '@/components/user-avatar-profile'
import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle'

export const NavbarPOSMatriz = () => {
	return (
		<header className='flex shrink-0 items-center justify-between gap-2 p-0 px-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14'>
			<LogoType />

			<div className='flex items-center gap-2'>
				<ModeToggle />
				<LogoutButton />
				<UserAvatarProfile showInfo={false} />
			</div>
		</header>
	)
}
