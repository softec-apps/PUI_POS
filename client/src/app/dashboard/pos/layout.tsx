import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'POS | PUI POS',
	description: 'Gestiona y configura los categorias de tus productos en PUI POS.',
}

export default async function PosLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
