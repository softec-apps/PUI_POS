'use client'

import { RoleGuard } from '@/components/layout/RoleGuard'
import PageContainer from '@/components/layout/page-container'
import { TemplateView } from '@/modules/template/components/view/TemplateView'

export default function TemplatesPage() {
	return (
		<RoleGuard requiredRole='admin'>
			<PageContainer>
				<TemplateView />
			</PageContainer>
		</RoleGuard>
	)
}
