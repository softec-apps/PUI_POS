import { ALLOW_ROLES } from '@/common/constants/roles-const'
import PageContainer from '@/components/layout/page-container'
import { RoleGuard } from '@/components/layout/RoleGuard'
import { PreferencesView } from '@/modules/preferences/components/view/PreferencesView'

export default async function UserPage() {
	return (
		<RoleGuard requiredRole={[ALLOW_ROLES.ADMIN, ALLOW_ROLES.MANAGER]}>
			<PageContainer>
				<PreferencesView />
			</PageContainer>
		</RoleGuard>
	)
}
