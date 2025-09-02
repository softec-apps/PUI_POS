export const ALLOW_ROLES = {
	ADMIN: 'admin',
	MANAGER: 'manager',
	INVENTORY: 'inventory',
	CASHIER: 'cashier',
} as const

export type UserRole = (typeof ALLOW_ROLES)[keyof typeof ALLOW_ROLES]
