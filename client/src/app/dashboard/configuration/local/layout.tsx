import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Configuración',
	description: 'Configuración POS',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
