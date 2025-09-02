'use client'

import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'
import { I_Role } from '@/common/hooks/useRole'
import { UserFormData } from '@/modules/user/types/user-form'
import { translateRoleName } from '@/common/utils/traslate.util'
import { Control, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ALLOW_ROLES } from '@/common/constants/roles-const'

interface RolSectionProps {
	control: Control<UserFormData>
	roles: I_Role[]
	isLoadingRoles: boolean
	setValue: UseFormSetValue<UserFormData>
	watch: UseFormWatch<UserFormData>
}

export function RolSection({ control, roles, isLoadingRoles, setValue, watch }: RolSectionProps) {
	const selectedRoleId = watch('roleId')

	const roleOptions = roles.map(role => ({
		id: role.id,
		name: translateRoleName(role.name),
		description: role.description || `Acceso como ${translateRoleName(role.name)}`,
		icon: getRoleIcon(role.name),
		permissions: getRolePermissions(role.name),
	}))

	const handleRoleSelect = (roleId: string) => {
		setValue('roleId', roleId, { shouldValidate: true })
	}

	return (
		<div className='space-y-4'>
			<div className='space-y-2'>
				<h3 className='flex items-center gap-2 text-lg font-medium'>
					<Icons.shield className='h-4 w-4' />
					Selección de Rol
				</h3>
				<p className='text-muted-foreground text-sm'>
					Selecciona el rol que define los permisos y nivel de acceso del usuario
				</p>
			</div>
			<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
				{roleOptions.map(role => (
					<Card
						key={role.id}
						className={cn(
							'hover:border-primary hover:bg-accent/50 cursor-pointer p-4 shadow-none transition-all duration-500',
							selectedRoleId === role.id && 'border-primary bg-accent/50',
							isLoadingRoles && 'cursor-not-allowed opacity-50'
						)}
						onClick={() => !isLoadingRoles && handleRoleSelect(role.id)}>
						<CardHeader className='flex flex-row items-center justify-between space-y-0 space-x-4 p-0'>
							<div className='bg-accent rounded-lg p-2'>
								<role.icon className='text-primary h-5 w-5' />
							</div>
							<div className='flex-1'>
								<CardTitle className='flex justify-between text-base'>
									<span>{role.name}</span>
									{selectedRoleId === role.id}
								</CardTitle>
							</div>
						</CardHeader>

						{/* 
						<CardContent className='p-0'>
							<div className='text-muted-foreground text-xs'>
								<div className='mb-1 font-medium'>Permisos:</div>
								<ul className='space-y-1'>
									{role.permissions.map((permission, index) => (
										<li key={index} className='flex items-center gap-1'>
											<Icons.checkCircle className='h-3 w-3 text-green-500' />
											{permission}
										</li>
									))}
								</ul>
							</div>
						</CardContent>
						*/}
					</Card>
				))}
			</div>
		</div>
	)
}

// Helper function to get icon for each role
function getRoleIcon(roleName: string) {
	switch (roleName.toLowerCase()) {
		case ALLOW_ROLES.CASHIER:
			return Icons.cashRegister
		case ALLOW_ROLES.INVENTORY:
			return Icons.box
		case ALLOW_ROLES.MANAGER:
			return Icons.userBolt
		default:
			return Icons.circles
	}
}

// Helper function to get permissions for each role
function getRolePermissions(roleName: string): string[] {
	switch (roleName.toLowerCase()) {
		case 'manager':
			return ['Gestión de contenido', 'Moderación', 'Reportes']
		case 'editor':
			return ['Creación de contenido', 'Edición de contenido']
		case 'user':
			return ['Acceso básico', 'Perfil personal']
		default:
			return ['Acceso limitado']
	}
}
