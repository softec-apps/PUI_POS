import { FooterSection } from '@/components/Footer'
import { HeaderAuth } from '@/modules/auth/components/templates/header'
import { TermsOfServicePage } from '@/modules/terms_services/components/view/TermsService'

export default async function TermsServicePage() {
	return (
		<>
			<HeaderAuth />
			<TermsOfServicePage />
			<FooterSection />
		</>
	)
}
