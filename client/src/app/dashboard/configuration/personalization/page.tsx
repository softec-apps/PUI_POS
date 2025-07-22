import PageContainer from '@/components/layout/page-container'
import { PersonalizationView } from '@/modules/configuration/personalization/components/view/PersonalizationView'

export default async function UserPage() {
	return (
		<PageContainer>
			<PersonalizationView />
		</PageContainer>
	)
}
