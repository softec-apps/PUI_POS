import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Facturación',
	description: 'Facturación POS',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
