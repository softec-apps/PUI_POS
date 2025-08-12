import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Clientes | PUI POS',
	description: 'Gestiona tus clientes en PUI POS.',
}

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
