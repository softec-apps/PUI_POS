import PageContainer from '@/components/layout/page-container'
import { LocalView } from '@/modules/configuration/local/components/view/LocalView'

export default async function UserPage() {
	return (
		<PageContainer>
			<LocalView />
		</PageContainer>
	)
}
