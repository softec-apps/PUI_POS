import type { Metadata } from 'next'
import { SidebarInset } from '@/components/ui/sidebar'
import { NavbarPOSMatriz } from '@/modules/pos/pos/components/template/PosNavbar'

export const metadata: Metadata = {
	title: 'POS',
	description: 'POS',
}

export default async function POSLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarInset className='bg-muted/50 dark:bg-card shadow-none'>
			<NavbarPOSMatriz />
			{children}
		</SidebarInset>
	)
}
