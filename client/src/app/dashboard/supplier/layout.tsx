import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Proveedores | PUI POS',
	description: 'Gestiona y configura los proveedores de tus productos en PUI POS.',
}

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
