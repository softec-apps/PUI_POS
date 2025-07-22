'use client'

import { RoleGuard } from '@/components/layout/RoleGuard'
import { ALLOW_ROLES } from '@/common/constants/roles-const'
import PageContainer from '@/components/layout/page-container'
import { SupplierView } from '@/modules/supplier/components/view/SupplierView'

export default function SupplierPage() {
	return (
		<RoleGuard requiredRole={[ALLOW_ROLES.ADMIN, ALLOW_ROLES.MANAGER]}>
			<PageContainer>
				<SupplierView />
			</PageContainer>
		</RoleGuard>
	)
}
