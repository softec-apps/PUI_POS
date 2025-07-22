import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Productos | PUI POS',
	description: 'Gestiona y configura los productos en PUI POS.',
}

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
