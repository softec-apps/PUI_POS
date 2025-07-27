'use client'

import { useParams } from 'next/navigation'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { ALLOW_ROLES } from '@/common/constants/roles-const'
import PageContainer from '@/components/layout/page-container'
import { ProductDetailView } from '@/modules/product/components/view/ProductDetailView'

export default function ProductDetailPage() {
	const params = useParams()
	const productId = params.id as string

	return (
		<RoleGuard requiredRole={[ALLOW_ROLES.ADMIN, ALLOW_ROLES.MANAGER]}>
			<PageContainer>
				<ProductDetailView productId={productId} />
			</PageContainer>
		</RoleGuard>
	)
}
