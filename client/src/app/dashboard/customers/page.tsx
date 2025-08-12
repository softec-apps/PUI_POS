'use client'

import { RoleGuard } from '@/components/layout/RoleGuard'
import { ALLOW_ROLES } from '@/common/constants/roles-const'
import PageContainer from '@/components/layout/page-container'
import { CustomerView } from '@/modules/customer/components/view/CustomerView'

export default function CustomerPage() {
	return (
		<RoleGuard requiredRole={[ALLOW_ROLES.ADMIN, ALLOW_ROLES.MANAGER]}>
			<PageContainer>
				<CustomerView />
			</PageContainer>
		</RoleGuard>
	)
}
