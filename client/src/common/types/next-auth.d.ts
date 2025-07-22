declare module 'next-auth' {
	interface Session {
		accessToken?: string
		refreshToken?: string
		tokenExpires?: number
		user: {
			id: string
			email: string
			name?: string
			image?: string
			role?: string
			status?: string
			firstName?: string
			lastName?: string
		}
	}

	interface User {
		id: string
		email: string
		name?: string
		image?: string
		role?: string
		status?: string
		firstName?: string
		lastName?: string
		token?: string
		refreshToken?: string
		tokenExpires?: number
	}
}

declare module 'next-auth/jwt' {
	interface JWT {
		accessToken?: string
		refreshToken?: string
		tokenExpires?: number
		role?: string
		status?: string
		firstName?: string
		lastName?: string
	}
}
