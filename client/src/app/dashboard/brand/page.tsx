'use client'

import { RoleGuard } from '@/components/layout/RoleGuard'
import { ALLOW_ROLES } from '@/common/constants/roles-const'
import PageContainer from '@/components/layout/page-container'
import { BrandView } from '@/modules/brand/components/view/BrandView'

export default function BrandPage() {
	return (
		<RoleGuard requiredRole={[ALLOW_ROLES.ADMIN, ALLOW_ROLES.MANAGER]}>
			<PageContainer>
				<BrandView />
			</PageContainer>
		</RoleGuard>
	)
}
