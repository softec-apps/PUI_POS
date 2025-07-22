import PageContainer from '@/components/layout/page-container'
import { UserView } from '@/modules/user/components/view/UserView'

export default async function UserPage() {
	return (
		<PageContainer>
			<UserView />
		</PageContainer>
	)
}
