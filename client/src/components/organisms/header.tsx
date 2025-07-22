'use client'

import React from 'react'
import { Separator } from '../ui/separator'
import { SidebarTrigger } from '../ui/sidebar'
import { ModeToggle } from '../layout/ThemeToggle/theme-toggle'
import { Notifications } from '../Notifications'
import { UserAvatarProfile } from '../user-avatar-profile'

export function Header() {
	return (
		<header className='flex h-16 shrink-0 items-center justify-between gap-2 p-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16'>
			<div className='flex items-center gap-2'>
				<SidebarTrigger />
				<Separator orientation='vertical' />
			</div>

			<div className='flex items-center gap-2'>
				<Notifications />
				<ModeToggle />
				<UserAvatarProfile showInfo={false} />
			</div>
		</header>
	)
}
