import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROUTE_PATH } from '@/common/constants/routes-const'

const adminRoutes = Object.values(ROUTE_PATH.ADMIN).flatMap(route =>
	typeof route === 'string' ? route : Object.values(route)
)

export async function middleware(request: NextRequest) {
	const session = await auth()
	const { pathname } = request.nextUrl
	const protectedRoutes = [...adminRoutes]
	const isProtected = protectedRoutes.some(route => pathname.startsWith(route))

	if (!session && isProtected) return NextResponse.redirect(new URL(ROUTE_PATH.AUTH.SIGNIN, request.url))

	if (session && pathname.startsWith(ROUTE_PATH.AUTH.SIGNIN))
		return NextResponse.redirect(new URL(ROUTE_PATH.HOME, request.url))

	return NextResponse.next()
}

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		// Always run for API routes
		'/(api|trpc)(.*)',
	],
}
