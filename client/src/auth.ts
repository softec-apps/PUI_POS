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
							id: data.user.id,
							email: data.user.email,
							name: `${data.user.firstName} ${data.user.lastName}`,
							firstName: data.user.firstName,
							lastName: data.user.lastName,
							image: data.user?.photo?.path,
							token: data.token,
							refreshToken: data.refreshToken,
							tokenExpires: data.tokenExpires,
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
			// Verificar si el token ha expirado
			const now = Date.now()
			const tokenExpires = token.tokenExpires ? new Date(token.tokenExpires).getTime() : 0

			if (tokenExpires && now >= tokenExpires) {
				// Token expirado, intentar refrescar
				try {
					const refreshedTokens = await refreshAccessToken()
					if (refreshedTokens) {
						// Actualizar el token en la sesión
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
			if (token.user) {
				session.user = {
					id: token.user.id,
					name: token.user.name,
					email: token.user.email,
					image: token.user.image,
					firstName: token.user.firstName,
					lastName: token.user.lastName,
				}
			}

			// Asignar tokens a la sesión
			session.token = token.token
			session.refreshToken = token.refreshToken
			session.tokenExpires = token.tokenExpires

			return session
		},

		async jwt({ token, user, account, profile }) {
			// Si es un nuevo login
			if (user) {
				token.user = {
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
					firstName: user.firstName,
					lastName: user.lastName,
				}
				token.token = user.token
				token.refreshToken = user.refreshToken
				token.tokenExpires = user.tokenExpires
				return token
			}

			// Para login con Google
			if (account?.provider === 'google' && profile) {
				token.user = {
					id: profile.sub,
					name: profile.name,
					email: profile.email,
					image: profile.picture,
					firstName: profile.given_name,
					lastName: profile.family_name,
				}
				return token
			}

			// Verificar si el token necesita ser refrescado
			const now = Date.now()
			const tokenExpires = token.tokenExpires ? new Date(token.tokenExpires as string).getTime() : 0

			// Si el token expira en menos de 5 minutos, intentar refrescarlo
			try {
				const refreshedTokens = await refreshAccessToken()
				if (refreshedTokens) {
					token.token = refreshedTokens.token
					token.refreshToken = refreshedTokens.refreshToken
					token.tokenExpires = refreshedTokens.tokenExpires
				}
			} catch (error) {
				console.error('Error al refrescar token en JWT:', error)
				// Marcar el token como expirado
				token.error = 'RefreshAccessTokenError'
			}
			return token
		},

		async signIn({ user, account, profile }) {
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
					user.id = data.user.id
					user.name = `${data.user.firstName} ${data.user.lastName}`
					user.firstName = data.user.firstName
					user.lastName = data.user.lastName
					user.email = data.user.email
					user.image = data.user.photo?.path
					user.token = data.token
					user.refreshToken = data.refreshToken
					user.tokenExpires = data.tokenExpires
				} catch (error) {
					console.error('Error en login con Google:', error)
					return false
				}
			}
			return true
		},

		async redirect({ url, baseUrl }) {
			return url.startsWith(baseUrl) ? url : baseUrl
		},
	},
	pages: {
		signIn: ROUTE_PATH.AUTH.SIGNIN,
	},
	session: {
		strategy: 'jwt',
		maxAge: 60 * 60 * 24, // 1 dia
		//updateAge: 60 * 15, // Actualizar sesión cada 15 minutos si está activa
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
