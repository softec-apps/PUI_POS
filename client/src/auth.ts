import axios from 'axios'
import api from '@/lib/axios'
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import CredentialsProvider from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
	providers: [
		Google({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			authorization: {
				params: {
					prompt: 'consent',
					access_type: 'offline',
					response_type: 'code',
					scope: 'openid email profile',
				},
			},
		}),
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'text' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				try {
					const { data } = await axios.post(
						'http://localhost:4000/api/v1/auth/email/login',
						{
							email: credentials?.email,
							password: credentials?.password,
						},
						{
							headers: {
								'Content-Type': 'application/json',
							},
						}
					)
					if (data) {
						return {
							id: data.user.id.toString(),
							email: data.user.email,
							name: `${data.user.firstName} ${data.user.lastName}`,
							firstName: data.user.firstName,
							lastName: data.user.lastName,
							image: data.user?.photo?.path,
							token: data.token,
							refreshToken: data.refreshToken,
							tokenExpires: data.tokenExpires,
							role: {
								id: data.user.role.id,
								name: data.user.role.name,
							},
						}
					}
					return null
				} catch (error) {
					console.error('Error en autenticación con credenciales:', error)
					return null
				}
			},
		}),
	],
	callbacks: {
		async session({ session, token }) {
			console.log('Session callback - token:', token)

			// Verificar si el token ha expirado
			const now = Date.now()
			const tokenExpires = token.tokenExpires ? new Date(token.tokenExpires as string).getTime() : 0

			if (tokenExpires && now >= tokenExpires) {
				// Token expirado, intentar refrescar
				try {
					const refreshedTokens = await refreshAccessToken()
					if (refreshedTokens) {
						token.token = refreshedTokens.token
						token.refreshToken = refreshedTokens.refreshToken
						token.tokenExpires = refreshedTokens.tokenExpires
					} else {
						// Si no se puede refrescar, marcar como expirada
						return {
							...session,
							expires: new Date(0).toISOString(),
							error: 'RefreshAccessTokenError',
						}
					}
				} catch (error) {
					console.error('Error al refrescar token:', error)
					return {
						...session,
						expires: new Date(0).toISOString(),
						error: 'RefreshAccessTokenError',
					}
				}
			}

			// Asignar datos del usuario a la sesión
			if (token.sub) {
				session.user = {
					id: token.sub,
					name: token.name || '',
					email: token.email || '',
					image: token.image,
					firstName: token.firstName as string,
					lastName: token.lastName as string,
					role: {
						id: token.roleId as number,
						name: token.roleName as string,
					},
				}
			}

			// Asignar tokens a la sesión
			session.token = token.token as string
			session.refreshToken = token.refreshToken as string
			session.tokenExpires = token.tokenExpires as number

			console.log('Session callback - final session:', session)
			return session
		},

		async jwt({ token, user, account, profile }) {
			console.log('JWT callback - user:', user, 'account:', account)

			// Si es un nuevo login con credenciales
			if (user && account?.provider === 'credentials') {
				token.token = user.token
				token.refreshToken = user.refreshToken
				token.tokenExpires = user.tokenExpires
				token.firstName = user.firstName
				token.lastName = user.lastName
				token.roleId = user.role?.id
				token.roleName = user.role?.name

				console.log('JWT callback - credentials login, role:', user.role?.name)
				return token
			}

			// Para login con Google (después del signIn callback)
			if (user && account?.provider === 'google') {
				token.token = user.token
				token.refreshToken = user.refreshToken
				token.tokenExpires = user.tokenExpires
				token.firstName = user.firstName
				token.lastName = user.lastName
				token.roleId = user.role?.id
				token.roleName = user.role?.name

				console.log('JWT callback - google login, role:', user.role?.name)
				return token
			}

			console.log('JWT callback - existing token, role:', token.roleName)
			return token
		},

		async signIn({ user, account, profile }) {
			console.log('SignIn callback - provider:', account?.provider)

			// Solo para proveedor Google
			if (account?.provider === 'google') {
				try {
					const { data } = await axios.post('http://localhost:4000/api/v1/auth/google/login', {
						idToken: account.id_token,
					})

					if (!data) {
						console.error('Error registrando el usuario en el backend')
						return false
					}

					// Asignamos los datos recibidos del backend
					user.id = data.user.id.toString()
					user.name = `${data.user.firstName} ${data.user.lastName}`
					user.firstName = data.user.firstName
					user.lastName = data.user.lastName
					user.email = data.user.email
					user.image = data.user.photo?.path
					user.token = data.token
					user.refreshToken = data.refreshToken
					user.tokenExpires = data.tokenExpires
					user.role = {
						id: data.user.role.id,
						name: data.user.role.name,
					}

					console.log('SignIn callback - Google user role:', data.user.role.name)
				} catch (error) {
					console.error('Error en login con Google:', error)
					return false
				}
			}
			return true
		},

		async redirect({ url, baseUrl }) {
			// Si viene de signOut, permitir la redirección
			if (url.includes(ROUTE_PATH.AUTH.SIGNIN)) return url
			return url.startsWith(baseUrl) ? url : baseUrl
		},
	},
	pages: {
		signIn: ROUTE_PATH.AUTH.SIGNIN,
	},
	session: {
		strategy: 'jwt',
		maxAge: 60 * 60 * 24, // 1 dia
	},
	jwt: {
		maxAge: 60 * 60 * 24, // 1 dia
	},
})

// Función para refrescar el access token
async function refreshAccessToken() {
	try {
		const response = await api.post('/auth/refresh')
		const { token, refreshToken: newRefreshToken, tokenExpires } = response.data
		return {
			token,
			refreshToken: newRefreshToken,
			tokenExpires,
		}
	} catch (error) {
		console.error('Error al refrescar el token:', error)
		return null
	}
}
