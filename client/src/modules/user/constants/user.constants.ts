import { Pagination, SortOption } from '@/modules/atribute/types/pagination'

export const SORT_OPTIONS: SortOption[] = [
	{ label: 'Nombre (A-Z)', field: 'firstName', order: 'asc', key: 'firstName:asc' },
	{ label: 'Nombre (Z-A)', field: 'firstName', order: 'desc', key: 'firstName:desc' },
	{ label: 'Apellido (A-Z)', field: 'lastName', order: 'asc', key: 'lastName:asc' },
	{ label: 'Apellido (Z-A)', field: 'lastName', order: 'desc', key: 'lastName:desc' },
	{ label: 'Email (A-Z)', field: 'email', order: 'asc', key: 'email:asc' },
	{ label: 'Email (Z-A)', field: 'email', order: 'desc', key: 'email:desc' },
	{ label: 'Fecha reciente', field: 'createdAt', order: 'desc', key: 'createdAt:desc' },
	{ label: 'Fecha antigua', field: 'createdAt', order: 'asc', key: 'createdAt:asc' },
]

export const INITIAL_PAGINATION: Pagination = {
	page: 1,
	limit: 10,
	filters: {},
	sort: [],
	search: '',
}

export const STATUS_ALLOW = {
	ACTIVE: 'active',
	INACTIVE: 'inactive',
} as const

export const STATUS_OPTIONS = [
	{ label: 'Activo', value: STATUS_ALLOW.ACTIVE },
	{ label: 'Inactivo', value: STATUS_ALLOW.INACTIVE },
]

export type StatusAllow = (typeof STATUS_ALLOW)[keyof typeof STATUS_ALLOW]
