'use client'

import { useParams } from 'next/navigation'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { ALLOW_ROLES } from '@/common/constants/roles-const'
import PageContainer from '@/components/layout/page-container'
import { SaleDetailView } from '@/modules/sale/components/view/SaleDetailView'

export default function SaleDetailPage() {
	const params = useParams()
	const saleId = params.id as string

	return (
		<RoleGuard requiredRole={[ALLOW_ROLES.ADMIN, ALLOW_ROLES.MANAGER]}>
			<PageContainer>
				<SaleDetailView saleId={saleId} />
			</PageContainer>
		</RoleGuard>
	)
}
