import PageContainer from '@/components/layout/page-container'
import { DashboardView } from '@/modules/dashboard/components/view/Dashboard'

export default async function DashboardPage() {
	return (
		<PageContainer>
			<DashboardView />
		</PageContainer>
	)
}
