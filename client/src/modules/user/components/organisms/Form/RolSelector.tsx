'use client'

import { Control } from 'react-hook-form'
import { Icons } from '@/components/icons'
import { I_Role } from '@/common/hooks/useRole'
import { UserFormData } from '@/modules/user/types/user-form'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { translateRoleName } from '@/common/utils/traslate.util'

interface RolSectionProps {
	control: Control<UserFormData>
	roles: I_Role[]
	isLoadingRoles: boolean
}

export function RolSection({ control, roles, isLoadingRoles }: RolSectionProps) {
	const roleOptions = roles.map(role => ({
		value: role.id,
		label: translateRoleName(role.name),
	}))

	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardHeader className='p-0'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<Icons.circles className='h-4 w-4' />
					Asignación de Rol
				</CardTitle>
				<CardDescription>
					Define el rol del usuario para controlar sus permisos y nivel de acceso dentro del sistema
				</CardDescription>
			</CardHeader>

			<CardContent className='grid grid-cols-1 items-start gap-4 p-0 md:grid-cols-1'>
				<UniversalFormField
					required
					control={control}
					name='roleId'
					type='select'
					label='Seleccionar rol'
					placeholder='Seleccionar'
					options={roleOptions}
					disabled={isLoadingRoles}
				/>
			</CardContent>
		</Card>
	)
}
