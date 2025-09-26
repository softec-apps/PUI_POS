'use client'

import { LucideHeart } from 'lucide-react'
import { Footer } from '@/components/ui/footer'
import { DEV_INFO } from '@/common/constants/devInfo-const'
import { SITE_CONFIG } from '@/common/constants/siteConf-const'

export function FooterPublic() {
	return (
		<Footer className='bg-popover px-2 py-1.5 sm:px-4 dark:bg-[#0b0b0b]'>
			<div className='flex items-center justify-between gap-2'>
				<p className='text-muted-foreground flex gap-1 text-xs'>
					&copy; {new Date().getFullYear()} {SITE_CONFIG.DOAMIN} - {SITE_CONFIG.NAME}.{' '}
					<span className='hidden sm:flex'>Todos los derechos reservados.</span>
				</p>
				<div className='text-muted-foreground flex items-center gap-1 text-xs'>
					<span className='flex gap-1 text-xs font-medium'>
						Made with
						<LucideHeart className='text-destructive size-4' fill='currentColor' />
						by
					</span>

					<div className='flex items-center gap-2'>
						<a
							href={DEV_INFO.SOCIAL.FB}
							className='block text-xs font-medium underline transition-colors duration-200 hover:text-neutral-700'
							target='_blank'
							rel='noopener noreferrer'>
							{DEV_INFO.NAME}
						</a>
					</div>
				</div>
			</div>
		</Footer>
	)
}
