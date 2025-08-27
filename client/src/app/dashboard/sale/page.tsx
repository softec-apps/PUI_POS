'use client'

import { RoleGuard } from '@/components/layout/RoleGuard'
import { ALLOW_ROLES } from '@/common/constants/roles-const'
import PageContainer from '@/components/layout/page-container'
import { SaleView } from '@/modules/sale/components/view/SaleView'

export default function SalePage() {
	return (
		<RoleGuard requiredRole={[ALLOW_ROLES.ADMIN, ALLOW_ROLES.MANAGER]}>
			<PageContainer>
				<SaleView />
			</PageContainer>
		</RoleGuard>
	)
}
