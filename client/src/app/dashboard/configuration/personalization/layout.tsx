import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Preferencias',
	description: 'Preferencias POS',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
