'use client'

import { Control } from 'react-hook-form'
import { Icons } from '@/components/icons'
import { UserFormData } from '@/modules/user/types/user-form'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface SecuritySectionProps {
	control: Control<UserFormData>
	isEditing: boolean
}

export function SecuritySection({ control, isEditing }: SecuritySectionProps) {
	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.key className='h-4 w-4' />
					Seguridad
				</CardTitle>
				<CardDescription>
					Establece una contraseña segura para proteger el acceso a la cuenta del usuario
				</CardDescription>
			</CardHeader>

			<CardContent className='grid grid-cols-1 items-start gap-4 p-0 md:grid-cols-2'>
				<UniversalFormField
					control={control}
					name='password'
					type='password'
					label='Contraseña'
					placeholder='********'
					max={12}
					min={8}
					required={isEditing ? false : true}
				/>

				<UniversalFormField
					control={control}
					name='passwordConfirm'
					type='password'
					label='Confirmar contraseña'
					placeholder='********'
					max={12}
					min={8}
					required={isEditing ? false : true}
				/>
			</CardContent>
		</Card>
	)
}
