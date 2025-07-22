import { FooterSection } from '@/components/Footer'
import { HeaderAuth } from '@/modules/auth/components/templates/header'
import { PrivacyPolicyView } from '@/modules/privacy_policy/components/view/PrivacyPolicy'

export default async function PrivacyPolicyPage() {
	return (
		<>
			<HeaderAuth />
			<PrivacyPolicyView />
			<FooterSection />
		</>
	)
}
