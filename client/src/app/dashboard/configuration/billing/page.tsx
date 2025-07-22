import PageContainer from '@/components/layout/page-container'
import { BillingView } from '@/modules/configuration/billing/components/view/BillingView'

export default async function UserPage() {
	return (
		<PageContainer>
			<BillingView />
		</PageContainer>
	)
}
