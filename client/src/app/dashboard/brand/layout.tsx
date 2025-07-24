import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Marcas | PUI POS',
    description: 'Gestiona y configura los marcas de tus productos en PUI POS.',
}

export default async function BrandLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
