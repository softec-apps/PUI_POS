import { Icons } from '@/components/icons'
import { Permission } from '@/common/constants/rolePermissions-const'

export interface BaseNavItem {
	title: string
	url?: string // Hacer opcional para items padre que pueden no tener URL
	icon?: keyof typeof Icons
	isActive?: boolean
	permission: Permission
	disabled?: boolean
	external?: boolean
	label?: string
	description?: string
	permission?: Permission
}

export interface NavItemLeaf extends BaseNavItem {
	url: string // Obligatorio para hojas
	items?: never // No permitir items en hojas
}

export interface NavItemParent extends BaseNavItem {
	items: NavItem[] // Obligatorio para padres
	url?: string // Opcional para padres
}

export type NavItem = NavItemLeaf | NavItemParent

export interface NavGroup {
	groupName: string
	items: NavItem[]
	permission: Permission[]
}

export type NavConfig = NavGroup[]
