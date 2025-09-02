'use client'

import { Typography } from '@/components/ui/typography'
import { TypeView } from '@/modules/preferences/components/templates/TypeViewPos'
import { SystemPreferences } from '@/modules/preferences/components/templates/SystemPreferences'
import { BillingConfiguration } from '@/modules/preferences/components/templates/BillingConfiguration'

export function PreferencesView() {
	return (
		<div className='flex w-full flex-col gap-12'>
			<div className='space-y-6'>
				<Typography variant='h3' className='font-bold'>
					Preferencias
				</Typography>

				<TypeView />
			</div>

			<div className='space-y-6'>
				<Typography variant='h3' className='font-bold'>
					Establecimiento
				</Typography>

				<SystemPreferences />
			</div>

			<div className='space-y-6'>
				<Typography variant='h3' className='font-bold'>
					Facturacion electrónica
				</Typography>

				<BillingConfiguration />
			</div>
		</div>
	)
}
