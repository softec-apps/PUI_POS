'use client'

import { ALLOW_ROLES } from '@/common/constants/roles-const'
import { RoleGuard } from '@/components/layout/RoleGuard'
import PageContainer from '@/components/layout/page-container'
import { CategoryView } from '@/modules/category/components/view/CategoryView'

export default function CategoryPage() {
	return (
		<RoleGuard requiredRole={[ALLOW_ROLES.ADMIN, ALLOW_ROLES.MANAGER]}>
			<PageContainer>
				<CategoryView />
			</PageContainer>
		</RoleGuard>
	)
}
