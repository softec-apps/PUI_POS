'use client'

import { useParams } from 'next/navigation'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { ALLOW_ROLES } from '@/common/constants/roles-const'
import PageContainer from '@/components/layout/page-container'
import { CustomerDetailView } from '@/modules/customer/components/view/CustomerDetailView'

export default function CustomerDetailPage() {
	const params = useParams()
	const customerId = params.id as string

	return (
		<RoleGuard requiredRole={[ALLOW_ROLES.ADMIN, ALLOW_ROLES.MANAGER]}>
			<PageContainer>
				<CustomerDetailView customerId={customerId} />
			</PageContainer>
		</RoleGuard>
	)
}
