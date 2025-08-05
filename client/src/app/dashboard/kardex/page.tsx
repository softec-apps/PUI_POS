'use client'

import { ALLOW_ROLES } from '@/common/constants/roles-const'
import { RoleGuard } from '@/components/layout/RoleGuard'
import PageContainer from '@/components/layout/page-container'
import { KardexView } from '@/modules/kardex/components/view/KardexView'

export default function KardexPage() {
	return (
		<RoleGuard requiredRole={[ALLOW_ROLES.ADMIN, ALLOW_ROLES.MANAGER]}>
			<PageContainer>
				<KardexView />
			</PageContainer>
		</RoleGuard>
	)
}
