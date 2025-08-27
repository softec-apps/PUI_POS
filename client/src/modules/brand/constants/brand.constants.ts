import { SortOption } from '@/common/types/pagination'

export const SORT_OPTIONS: SortOption[] = [
	{ label: 'Nombre (A-Z)', field: 'name', order: 'asc', key: 'name:asc' },
	{ label: 'Nombre (Z-A)', field: 'name', order: 'desc', key: 'name:desc' },
	{ label: 'Fecha reciente', field: 'createdAt', order: 'desc', key: 'createdAt:desc' },
	{ label: 'Fecha antigua', field: 'createdAt', order: 'asc', key: 'createdAt:asc' },
]

export const FIELDS = [
	{ key: 'name', name: 'Nombre' },
	{ key: 'createdAt', name: 'Fecha' },
] as const

export const STATUS_ALLOW = {
	ACTIVE: 'active',
	INACTIVE: 'inactive',
} as const

export const STATUS_OPTIONS = [
	{ label: 'Activo', value: STATUS_ALLOW.ACTIVE },
	{ label: 'Inactivo', value: STATUS_ALLOW.INACTIVE },
]

export type StatusAllow = (typeof STATUS_ALLOW)[keyof typeof STATUS_ALLOW]
