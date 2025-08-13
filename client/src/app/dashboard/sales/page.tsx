'use client'

import { ALLOW_ROLES } from '@/common/constants/roles-const'
import { RoleGuard } from '@/components/layout/RoleGuard'
import PageContainer from '@/components/layout/page-container'
import { SalesView } from '@/modules/sales/components/view/SalesView'

export default function SalesPage() {
	return (
		<RoleGuard requiredRole={[ALLOW_ROLES.ADMIN, ALLOW_ROLES.MANAGER]}>
			<PageContainer>
				<SalesView />
			</PageContainer>
		</RoleGuard>
	)
}
