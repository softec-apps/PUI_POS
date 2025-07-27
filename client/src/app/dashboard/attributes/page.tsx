'use client'

import { RoleGuard } from '@/components/layout/RoleGuard'
import { ALLOW_ROLES } from '@/common/constants/roles-const'
import PageContainer from '@/components/layout/page-container'
import { AttributesView } from '@/modules/atribute/components/view/AttributesView'

export default function AtributesPage() {
	return (
		<RoleGuard requiredRole={ALLOW_ROLES.ADMIN}>
			<PageContainer>
				<AttributesView />
			</PageContainer>
		</RoleGuard>
	)
}
