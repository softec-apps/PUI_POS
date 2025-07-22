'use client'

import { Icons } from '@/components/icons'
import { Typography } from '@/components/ui/typography'

type Props = {
	text?: string
}

export const SpinnerLoader = ({ text }: Props) => {
	return (
		<div className='flex items-center justify-center gap-2'>
			<Icons.spinnerDecored className='animate-spin' />
			{text && <Typography variant='span'>{text}</Typography>}
		</div>
	)
}
