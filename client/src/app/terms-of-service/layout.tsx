import type { Metadata } from 'next'
import { SidebarInset } from '@/components/ui/sidebar'

export const metadata: Metadata = {
	title: 'POS',
	description: 'POS',
}

export default function POSLayout({ children }: { children: React.ReactNode }) {
	return <SidebarInset className='bg-muted/30 dark:bg-card/90 h-screen shadow-none'>{children}</SidebarInset>
}
