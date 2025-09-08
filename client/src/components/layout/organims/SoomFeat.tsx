'use client'

import { Icons } from '@/components/icons'
import { UtilBanner } from '@/components/UtilBanner'
import { Badge } from '@/components/layout/atoms/Badge'

export const SoomFeatureBanner = () => {
	return (
		<div className='bg-muted dark:bg-popover space-y-12 rounded-2xl p-6'>
			<UtilBanner icon={<Icons.sparkles />} title='Promixamente' />
		</div>
	)
}

interface SoomFeatureBadgeProps {
	top?: number
	right?: number
}

export const SoomFeatureBadge = ({ top = 3, right = 3 }: SoomFeatureBadgeProps) => {
	return (
		<div className={`absolute top-${top} right-${right}`}>
			<Badge text='Próximamente' variant='amber' />
		</div>
	)
}
