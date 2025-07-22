export interface User {
	id: string
	email: string
	provider: string
	socialId: string | null
	firstName: string
	lastName: string
	role: {
		id: number
		name: string
		__entity: string
	}
	status: {
		id: number
		name: string
		__entity: string
	}
	createdAt: string
	updatedAt: string
	deletedAt: string | null
}

export interface LoginResponse {
	refreshToken: string
	token: string
	user: User
}

export interface AuthSession {
	user: {
		id: string
		email: string
		name: string
		firstName: string
		lastName: string
		role: User['role']
		status: User['status']
	}
	accessToken: string
	refreshToken: string
}

export interface User {
	id: string
	email: string
	name: string
}

export interface AuthContextType {
	user: User | null
	isLoading: boolean
	isAuthenticated: boolean
	error: string | null
	login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
	logout: () => void
	clearError: () => void
	verifyToken: (token: string) => Promise<void>
}
