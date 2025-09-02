import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { Header } from '@/components/organisms/header'
import AppSidebar from '@/components/layout/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export const metadata: Metadata = {
	title: 'Panel administrativo',
	description: 'Administra tu tienda desde aquí',
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const cookieStore = await cookies()
	const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true'

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<AppSidebar />
			<SidebarInset className='bg-popover dark:bg-background/40'>
				<Header />
				<main className='pr-1'>{children}</main>
			</SidebarInset>
		</SidebarProvider>
	)
}
