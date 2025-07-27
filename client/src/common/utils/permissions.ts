import { UserRole } from '@/common/types/roles'
import { ROLE_PERMISSIONS, Permission } from '@/common/constants/rolePermissions-const'

/**
 * Verifica si un rol de usuario tiene el permiso requerido
 */
export const hasPermission = (
	userRole: UserRole | string | undefined,
	requiredPermission?: Permission | string
): boolean => {
	if (!requiredPermission || !userRole) return false

	// Verificar si el permission existe en ROLE_PERMISSIONS
	const permissionRoles = ROLE_PERMISSIONS[requiredPermission as Permission]
	if (!permissionRoles) return false

	// Verificar si el rol del usuario está en la lista de roles permitidos para este permiso
	return permissionRoles.includes(userRole as UserRole)
}

/**
 * Verifica si un rol puede acceder a un grupo específico
 */
export const hasGroupPermission = (userRole: UserRole | string | undefined, groupPermissions?: UserRole[]): boolean => {
	if (!groupPermissions || !userRole) return false
	return groupPermissions.includes(userRole as UserRole)
}

/**
 * Verifica si un grupo debe mostrarse basado en permisos del grupo Y si tiene items visibles
 */
export const shouldShowGroup = (
	userRole: UserRole | string | undefined,
	groupPermissions?: UserRole[],
	hasVisibleItems: boolean = false
): boolean => {
	// Si no hay permisos de grupo, solo verificar si tiene items visibles
	if (!groupPermissions) return hasVisibleItems

	// Si hay permisos de grupo, verificar que el usuario tenga acceso AL GRUPO Y que tenga items visibles
	return hasGroupPermission(userRole, groupPermissions) && hasVisibleItems
}

/**
 * Obtiene todos los permisos para un rol específico
 */
export const getPermissionsForRole = (userRole: UserRole): Permission[] => {
	return Object.entries(ROLE_PERMISSIONS)
		.filter(([_, roles]) => roles.includes(userRole))
		.map(([permission]) => permission as Permission)
}

/**
 * Verifica si un rol puede acceder a al menos un item dentro de un grupo
 */
export const canAccessGroupItems = (userRole: UserRole, groupItems: any[]): boolean => {
	return groupItems.some(item => {
		// Verificar si el item tiene permiso y el usuario puede acceder
		if (item.permission && hasPermission(userRole, item.permission)) {
			return true
		}

		// Si tiene subitems, verificar si puede acceder a alguno
		if (item.items) {
			return item.items.some((subItem: any) => subItem.permission && hasPermission(userRole, subItem.permission))
		}

		// Si no tiene permiso específico, asumimos que puede acceder
		return !item.permission
	})
}
