import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Iniciar sesión',
	description: 'Iniciar sesión',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
	return <main>{children}</main>
}
