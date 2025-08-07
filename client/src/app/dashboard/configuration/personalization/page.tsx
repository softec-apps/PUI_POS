import { RoleGuard } from '@/components/layout/RoleGuard'
import { ALLOW_ROLES } from '@/common/constants/roles-const'
import PageContainer from '@/components/layout/page-container'
import { PersonalizationView } from '@/modules/personalization/components/view/PersonalizationView'

export default async function UserPage() {
	return (
		<RoleGuard requiredRole={[ALLOW_ROLES.ADMIN, ALLOW_ROLES.MANAGER]}>
			<PageContainer>
				<PersonalizationView />
			</PageContainer>
		</RoleGuard>
	)
}
