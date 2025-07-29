import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import { ALLOW_ROLES } from '@/common/constants/roles-const'

const adminRoutes = Object.values(ROUTE_PATH.ADMIN).flatMap(route =>
	typeof route === 'string' ? route : Object.values(route)
)

const posRoutes = Object.values(ROUTE_PATH.POS).flatMap(route =>
	typeof route === 'string' ? route : Object.values(route)
)

const protectedRoutes = [...adminRoutes, ...posRoutes]

export async function middleware(request: NextRequest) {
	try {
		const session = await auth()
		const { pathname } = request.nextUrl

		const isProtected = protectedRoutes.some(route => typeof route === 'string' && pathname.startsWith(route))
		const isSignInPage = pathname.startsWith(ROUTE_PATH.AUTH.SIGNIN)
		const isPosPage = pathname.startsWith(ROUTE_PATH.POS.MAIN)

		// ✅ AGREGAR: Excluir rutas de autenticación
		const isAuthRoute =
			pathname.startsWith('/api/auth') || pathname.startsWith(ROUTE_PATH.AUTH.SIGNIN) || pathname.startsWith('/auth')

		// No sesión y accede a ruta protegida
		if (!session && isProtected) return NextResponse.redirect(new URL(ROUTE_PATH.AUTH.SIGNIN, request.url))

		if (session) {
			const role = session?.user?.role?.name

			// Login con sesión activa
			if (isSignInPage) {
				if (role === ALLOW_ROLES.CASHIER) return NextResponse.redirect(new URL(ROUTE_PATH.POS.MAIN, request.url))
				return NextResponse.redirect(new URL(ROUTE_PATH.ADMIN.DASHBOARD, request.url))
			}

			// Solo cashier puede estar en /pos
			if (isPosPage && role !== ALLOW_ROLES.CASHIER)
				return NextResponse.redirect(new URL(ROUTE_PATH.ADMIN.DASHBOARD, request.url))

			// Cashier no puede entrar a rutas fuera de /pos, EXCEPTO rutas de auth
			if (role === ALLOW_ROLES.CASHIER && !isPosPage && !isAuthRoute)
				return NextResponse.redirect(new URL(ROUTE_PATH.POS.MAIN, request.url))

			// Redirección desde "/" según el rol
			if (pathname === ROUTE_PATH.HOME) {
				if (role === ALLOW_ROLES.CASHIER) return NextResponse.redirect(new URL(ROUTE_PATH.POS.MAIN, request.url))
				return NextResponse.redirect(new URL(ROUTE_PATH.ADMIN.DASHBOARD, request.url))
			}
		}

		return NextResponse.next()
	} catch (error) {
		console.error('Middleware error:', error)
		return NextResponse.next()
	}
}

export const config = {
	matcher: [
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		'/(api|trpc)(.*)',
	],
}
