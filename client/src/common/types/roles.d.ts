import { ALLOW_ROLES } from '@/common/constants/roles-const'

export type UserRole = (typeof ALLOW_ROLES)[keyof typeof ALLOW_ROLES]

export interface UserSession {
	user: {
		id: string
		name?: string | null
		email?: string | null
		firstName?: string
		lastName?: string
	}
}

export interface ApiUser {
	id: number
	email: string
	provider: string
	socialId?: string | null
	firstName: string
	lastName: string
	role: {
		id: number
		name: UserRole
		__entity: string
	}
	status: {
		id: number
		name: string
		__entity: string
	}
	createdAt: string
	updatedAt: string
	deletedAt?: string | null
}

export interface I_Role {
	id: string
	name: string
}
