'use client'

import Link from 'next/link'
import { BiSolidSend } from 'react-icons/bi'
import { ROUTE_PATH } from '@/common/constants/routes-const'

export const LogoSymbol = () => {
	return (
		<Link href={ROUTE_PATH.HOME} className='group'>
			<div className='flex items-center gap-2'>
				<div className='text-primary group-hover:bg-primary/10 flex size-6 items-center justify-center rounded-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-12'>
					<BiSolidSend className='text-lg' />
				</div>
			</div>
		</Link>
	)
}
