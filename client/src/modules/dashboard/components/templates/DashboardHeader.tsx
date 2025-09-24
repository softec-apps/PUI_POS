'use client'

import React from 'react'
import { Typography } from '@/components/ui/typography'
import { SITE_CONFIG } from '@/common/constants/siteConf-const'

interface DashboardHeaderProps {
	greeting: { text: string; emoji: string }
	userName: string
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ greeting, userName }) => {
	return (
		<div className='flex flex-col gap-2'>
			<Typography variant='h4' className='font-semibold'>
				{greeting?.text}, {userName} 👋
			</Typography>
			<Typography variant='span'>Bienvenido de nuevo. {SITE_CONFIG?.SLOGAN}</Typography>
		</div>
	)
}
