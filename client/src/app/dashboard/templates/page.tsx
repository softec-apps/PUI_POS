'use client'

import { RoleGuard } from '@/components/layout/RoleGuard'
import { ALLOW_ROLES } from '@/common/constants/roles-const'
import PageContainer from '@/components/layout/page-container'
import { TemplateView } from '@/modules/template/components/view/TemplateView'

export default function TemplatesPage() {
	return (
		<RoleGuard requiredRole={ALLOW_ROLES.ADMIN}>
			<PageContainer>
				<TemplateView />
			</PageContainer>
		</RoleGuard>
	)
}
