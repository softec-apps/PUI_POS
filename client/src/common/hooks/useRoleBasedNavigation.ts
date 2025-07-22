import { useMemo } from 'react'
import { useUserData } from '@/common/hooks/useSession'
import { ALL_NAV_ITEMS } from '@/common/constants/navItem-const'
import { ROLE_PERMISSIONS } from '@/common/constants/rolePermissions-const'

export const useRoleBasedNavigation = () => {
	const { userData, loading, userRole } = useUserData()

	const filteredNavItems = useMemo(() => {
		if (!userRole || !userData) return []

		return ALL_NAV_ITEMS.filter(item => {
			// Si el item tiene una propiedad permission, verificar si el rol tiene acceso
			if (item.permission) {
				const allowedRoles = ROLE_PERMISSIONS[item.permission]
				return allowedRoles?.includes(userRole)
			}

			// Si no tiene permission definida, permitir acceso (fallback)
			return true
		})
	}, [userRole, userData])

	return {
		navItems: filteredNavItems,
		userRole,
		userData,
		isLoading: loading,
	}
}
