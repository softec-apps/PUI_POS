import type { Metadata } from 'next'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

export const metadata: Metadata = {
	title: 'Categorias',
	description: 'Gerencie suas categorias',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	return <ProtectedRoute>{children}</ProtectedRoute>
}
