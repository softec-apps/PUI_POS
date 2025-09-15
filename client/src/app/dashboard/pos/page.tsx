'use client'

import { ALLOW_ROLES } from '@/common/constants/roles-const'
import { RoleGuard } from '@/components/layout/RoleGuard'
import PageContainer from '@/components/layout/page-container'
import { MatrizView } from '@/modules/pos/matriz/components/view/MatrizView'

export default function PosPage() {
	return (
		<RoleGuard requiredRole={[ALLOW_ROLES.ADMIN, ALLOW_ROLES.MANAGER, ALLOW_ROLES.CASHIER]}>
			<PageContainer scrollable={false}>
				<MatrizView />
			</PageContainer>
		</RoleGuard>
	)
}
