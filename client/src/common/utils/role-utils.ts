import { UserRole } from '@/common/types/roles'
import { ROLE_PERMISSIONS } from '@/common/constants/rolePermissions-const'

export const hasPermission = (userRole: UserRole, permission: string): boolean => {
	const allowedRoles = ROLE_PERMISSIONS[permission]
	return allowedRoles?.includes(userRole) ?? false
}

export const getRoleDisplayName = (role: UserRole): string => {
	const roleNames: Record<UserRole, string> = {
		admin: 'Administrador',
		manager: 'Gerente',
		employee: 'Empleado',
		viewer: 'Visualizador',
	}

	return roleNames[role] || role
}
