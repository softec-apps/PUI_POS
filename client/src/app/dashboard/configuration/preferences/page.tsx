import PageContainer from '@/components/layout/page-container'
import { PreferencesView } from '@/modules/configuration/prefetences/components/view/PreferencesView'

export default async function UserPage() {
	return (
		<PageContainer>
			<PreferencesView />
		</PageContainer>
	)
}
