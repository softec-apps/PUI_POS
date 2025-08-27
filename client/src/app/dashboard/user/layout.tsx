import type { Metadata } from 'next'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'

export const metadata: Metadata = {
	title: 'Usuarios',
	description: 'Panel de control para administrar usuarios, asignar permisos y gestionar roles en el sistema.',
}

export default async function UserLayout({ children }: { children: React.ReactNode }) {
	return <ProtectedRoute>{children}</ProtectedRoute>
}
