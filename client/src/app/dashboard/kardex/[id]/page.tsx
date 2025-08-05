'use client'

import { RoleGuard } from '@/components/layout/RoleGuard'
import { ALLOW_ROLES } from '@/common/constants/roles-const'
import PageContainer from '@/components/layout/page-container'
import { KardexDetailView } from '@/modules/kardex/components/view/KardexDetailView'

export default function KardexDetailPage({ params }: { params: { id: string } }) {
	return (
		<RoleGuard requiredRole={[ALLOW_ROLES.ADMIN, ALLOW_ROLES.MANAGER]}>
			<PageContainer>
				<KardexDetailView id={params?.id} />
			</PageContainer>
		</RoleGuard>
	)
}
