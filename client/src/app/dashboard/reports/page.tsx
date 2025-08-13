'use client'

import { ALLOW_ROLES } from '@/common/constants/roles-const'
import { RoleGuard } from '@/components/layout/RoleGuard'
import PageContainer from '@/components/layout/page-container'
import { ReportView } from '@/modules/reports/components/view/ReportView'

export default function ReportsPage() {
	return (
		<RoleGuard requiredRole={[ALLOW_ROLES.ADMIN, ALLOW_ROLES.MANAGER]}>
			<PageContainer>
				<ReportView />
			</PageContainer>
		</RoleGuard>
	)
}
