import axios from 'axios'
import api from '@/lib/axios'
import { getSession, signOut } from 'next-auth/react'
import { LoginResponse, User } from '@/common/types/auth'

export async function signIn(email: string, password: string): Promise<LoginResponse> {
	try {
		const response = await api.post<LoginResponse>('/auth/email/login', {
			email,
			password,
		})
		return response.data
	} catch (error) {
		if (axios.isAxiosError(error)) {
			throw {
				message: error.response?.data?.message || 'Login failed',
				statusCode: error.response?.status || 500,
				data: error.response?.data,
			}
		}
		throw {
			message: 'Login failed due to unexpected error',
			statusCode: 500,
		}
	}
}

export async function getAuthToken(): Promise<string | null> {
	const session = await getSession()
	return session?.token || null
}

export async function verifyToken(): Promise<User> {
	try {
		const token = await getAuthToken()
		if (!token) throw new Error('No authentication token found')

		const { data } = await api.get<LoginResponse>('/auth/me', {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})

		if (!data.success) throw new Error(data.message || 'Invalid token')

		return {
			id: data.data.id,
			email: data.data.email || '',
			name: data.data.name || '',
		}
	} catch (error: any) {
		throw new Error(error.response?.data?.message || 'Invalid token')
	}
}

export async function logout(): Promise<void> {
	try {
		// NextAuth.js signOut handles both client and server cleanup
		await signOut({ redirect: false })
	} catch (error) {
		console.error('Error during logout:', error)
		// Force sign out if there's an error
		await signOut({ redirect: false })
	}
}
