import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Plantillas | PUI POS',
	description: 'Gestiona y configura las plantillas de tus productos en PUI POS.',
}

export default async function TemplatesLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>
}
