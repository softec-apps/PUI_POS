import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Categorias | PUI POS',
	description: 'Gestiona y configura los categorias de tus productos en PUI POS.',
}

export default async function CategoryLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
