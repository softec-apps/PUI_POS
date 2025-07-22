'use client'

import { RoleGuard } from '@/components/layout/RoleGuard'
import PageContainer from '@/components/layout/page-container'
import { CategoryView } from '@/modules/category/components/view/CategoryView'

export default function CategoryPage() {
	return (
		<RoleGuard requiredRole='admin'>
			<PageContainer>
				<CategoryView />
			</PageContainer>
		</RoleGuard>
	)
}
