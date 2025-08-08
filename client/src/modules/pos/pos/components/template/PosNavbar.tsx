'use client'

import { LogoutButton } from '@/components/logout-button'
import { UserAvatarProfile } from '@/components/user-avatar-profile'
import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle'
import { useEstablishment } from '@/common/hooks/useEstablishment'
import { ImageControl } from '@/components/layout/organims/ImageControl'

export const NavbarPOSMatriz = () => {
	const { recordsData, loading, error } = useEstablishment()
	const dataRecord = recordsData?.data.items[0]

	return (
		<header className='flex h-14 shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-14'>
			<div className='flex aspect-square size-8 items-center justify-center'>
				<ImageControl
					recordData={dataRecord}
					enableHover={false}
					enableClick={false}
					imageHeight={35}
					imageWidth={35}
				/>
			</div>

			<div className='flex items-center gap-2'>
				<ModeToggle />
				<LogoutButton />
				<UserAvatarProfile showInfo={true} />
			</div>
		</header>
	)
}
