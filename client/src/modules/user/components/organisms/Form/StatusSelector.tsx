'use client'

import { Control } from 'react-hook-form'
import { Icons } from '@/components/icons'
import { I_Status } from '@/common/hooks/useStatus'
import { UserFormData } from '@/modules/user/types/user-form'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { translateStatusName } from '@/common/utils/traslate.util'

interface StatusSectionProps {
	control: Control<UserFormData>
	statuses: I_Status[]
	isLoadingStatuses: boolean
}

export function StatusSection({ control, statuses, isLoadingStatuses }: StatusSectionProps) {
	const statusOptions = statuses.map(status => ({
		value: status.id,
		label: translateStatusName(status.name),
	}))

	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.rosetteDiscountCheck className='h-4 w-4' />
					Estado del Usuario
				</CardTitle>
				<CardDescription>Selecciona si el usuario debe estar activo o inactivo dentro del sistema.</CardDescription>
			</CardHeader>

			<CardContent className='grid grid-cols-1 items-start gap-4 p-0 md:grid-cols-1'>
				<UniversalFormField
					required
					control={control}
					name='statusId'
					type='select'
					label='Seleccionar estado'
					placeholder='Selecciona un estado'
					options={statusOptions}
					disabled={isLoadingStatuses}
				/>
			</CardContent>
		</Card>
	)
}
