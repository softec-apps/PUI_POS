import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROUTE_PATH } from '@/common/constants/routes-const'

const adminRoutes = Object.values(ROUTE_PATH.ADMIN).flatMap(route =>
	typeof route === 'string' ? route : Object.values(route)
)

export async function middleware(request: NextRequest) {
	try {
		const session = await auth()
		const { pathname } = request.nextUrl

		const protectedRoutes = [...adminRoutes]
		const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
		const isSignInPage = pathname.startsWith(ROUTE_PATH.AUTH.SIGNIN)

		// 1. No hay sesión y trata de acceder a ruta protegida -> login
		if (!session && isProtected) return NextResponse.redirect(new URL(ROUTE_PATH.AUTH.SIGNIN, request.url))

		// 2. Hay sesión y está en página de login -> redirigir fuera del login
		if (session && isSignInPage) {
			// Redirigir a dashboard en lugar de HOME para evitar loops
			return NextResponse.redirect(new URL(ROUTE_PATH.ADMIN.DASHBOARD, request.url))
		}

		// 3. IMPORTANTE: Solo redirigir desde "/" si HOME no es "/"
		if (session && pathname === ROUTE_PATH.HOME && ROUTE_PATH.HOME !== ROUTE_PATH.HOME) {
			return NextResponse.redirect(new URL(ROUTE_PATH.HOME, request.url))
		}

		// 4. Si HOME es "/" y hay sesión, redirigir a dashboard
		if (session && pathname === ROUTE_PATH.HOME && ROUTE_PATH.HOME === ROUTE_PATH.HOME) {
			return NextResponse.redirect(new URL(ROUTE_PATH.ADMIN.DASHBOARD, request.url))
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
