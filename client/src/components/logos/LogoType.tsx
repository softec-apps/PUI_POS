'use client'

import Link from 'next/link'
import { BiSolidSend } from 'react-icons/bi'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import { SITE_CONFIG } from '@/common/constants/siteConf-const'

export const LogoType = () => {
	return (
		<Link href={ROUTE_PATH.HOME} className='group'>
			<div className='flex items-center gap-2'>
				<div className='text-secondary-foreground group-hover:bg-muted flex size-6 items-center justify-center rounded-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-12'>
					<BiSolidSend className='text-lg' />
				</div>

				<span className='text-secondary-foreground text-lg font-extrabold tracking-widest uppercase'>
					{SITE_CONFIG.NAME}
				</span>
			</div>
		</Link>
	)
}
