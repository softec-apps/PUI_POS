import { useMemo } from 'react'
import { ALL_NAV_ITEMS } from '@/common/constants/navItem-const'
import { hasPermission, shouldShowGroup } from '@/common/utils/permissions'
import { useUserData } from '@/common/hooks/useSession'
import { NavConfig } from '@/common/types/navItem'

export const useRoleBasedNavigation = () => {
	const { userData, loading } = useUserData()
	const userRole = userData?.role?.name

	const filteredNavItems = useMemo(() => {
		if (!userRole) return []

		const filtered: NavConfig = ALL_NAV_ITEMS.map(group => {
			// Filtrar items del grupo basado en permisos individuales
			const filteredItems = group.items
				.filter(item => {
					// Si el item tiene permiso específico, verificarlo
					if (item.permission && !hasPermission(userRole, item.permission)) {
						return false
					}

					// Si tiene subitems, verificar que al menos uno sea accesible
					if (item.items) {
						const accessibleSubItems = item.items.filter(
							subItem => !subItem.permission || hasPermission(userRole, subItem.permission)
						)
						return accessibleSubItems.length > 0
					}

					return true
				})
				.map(item => ({
					...item,
					// Filtrar subitems basado en permisos
					items:
						item.items?.filter(subItem => !subItem.permission || hasPermission(userRole, subItem.permission)) || [],
				}))

			return {
				...group,
				items: filteredItems,
			}
		}).filter(group => {
			// Verificar si el grupo debe mostrarse:
			// 1. El usuario debe tener permiso para ver el grupo (si está definido)
			// 2. Debe tener al menos un item visible dentro del grupo
			const hasVisibleItems = group.items.length > 0
			return shouldShowGroup(userRole, group.permission, hasVisibleItems)
		})

		return filtered
	}, [userRole])

	return {
		navItems: filteredNavItems,
		isLoading: loading,
		userRole,
	}
}
