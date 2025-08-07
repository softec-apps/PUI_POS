'use client'

import { Separator } from '@/components/ui/separator'
import { Typography } from '@/components/ui/typography'
import { TypeView } from '@/modules/preferences/components/templates/TypeViewPos'
import { SystemPreferences } from '@/modules/preferences/components/templates/SystemPreferences'

export function PreferencesView() {
	return (
		<div className='flex w-full flex-col gap-12'>
			<div className='space-y-6'>
				<Typography variant='h3' className='font-bold'>
					Preferencias
				</Typography>

				<TypeView />
			</div>

			<Separator />

			<div className='space-y-6'>
				<Typography variant='h3' className='font-bold'>
					Establecimiento
				</Typography>

				<SystemPreferences />
			</div>
		</div>
	)
}
