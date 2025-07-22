import './theme.css'
import './globals.css'

import { log } from '@/lib/log'
import { cn } from '@/lib/utils'

import { after } from 'next/server'
import { cookies } from 'next/headers'
import { fontVariables } from '@/lib/font'
import NextTopLoader from 'nextjs-toploader'
import type { Metadata, Viewport } from 'next'
import { Toaster } from '@/components/ui/sonner'
import Providers from '@/components/layout/providers'
import { unstable_noStore as noStore } from 'next/cache'

const META_THEME_COLORS = {
	light: '#ffffff',
	dark: '#09090b',
}

export const viewport: Viewport = {
	themeColor: META_THEME_COLORS.light,
}

export const metadata: Metadata = {
	title: 'Dovo POS',
	description:
		'Dovo POS es un sistema de punto de venta (POS) diseñado para simplificar la gestión de ventas y productos en tu negocio.',
	metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	noStore() // Opt out of static caching
	const cookieStore = cookies()
	const activeThemeValue = (await cookieStore).get('active_theme')?.value
	const isScaled = activeThemeValue?.endsWith('-scaled')

	after(async () => await log())

	return (
		<html lang='es' className='overflow-hidden'>
			<body
				className={cn(
					activeThemeValue ? `theme-${activeThemeValue}` : '',
					isScaled ? 'theme-scaled' : '',
					fontVariables
				)}>
				<NextTopLoader showSpinner={false} color='#a1a1a1' />
				<Providers activeThemeValue={activeThemeValue as string}>
					<Toaster position='top-center' richColors />
					<main className='bg-background font-sans antialiased'>{children}</main>
				</Providers>
			</body>
		</html>
	)
}
