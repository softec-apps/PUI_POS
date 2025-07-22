import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Atributos | PUI POS',
	description: 'Gestiona y configura los provvedores de tus productos en PUI POS.',
}

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
