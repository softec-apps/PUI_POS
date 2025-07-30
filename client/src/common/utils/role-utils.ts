import { UserRole, ALLOW_ROLES } from '@/common/constants/roles-const'

/**
 * Obtiene el nombre de visualización para un rol
 */
export const getRoleDisplayName = (role: UserRole | string): string => {
	const roleDisplayNames: Record<UserRole, string> = {
		[ALLOW_ROLES.ADMIN]: 'Administrador',
		[ALLOW_ROLES.MANAGER]: 'Gerente',
		[ALLOW_ROLES.CASHIER]: 'Vendedor',
	}

	return roleDisplayNames[role as UserRole] || 'Rol Desconocido'
}

/**
 * Verifica si un rol es válido
 */
export const isValidRole = (role: string): role is UserRole => {
	return Object.values(ALLOW_ROLES).includes(role as UserRole)
}

/**
 * Obtiene todos los roles disponibles
 */
export const getAllRoles = (): UserRole[] => {
	return Object.values(ALLOW_ROLES)
}
