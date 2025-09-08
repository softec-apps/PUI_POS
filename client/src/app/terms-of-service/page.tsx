import { HeaderAuth } from '@/modules/auth/components/templates/header'
import { FooterPublic } from '@/components/layout/templates/FooterPublic'
import { TermsOfServicePage } from '@/modules/terms_services/components/view/TermsService'

export default function TermsServicePage() {
	return (
		<div className='h-screen min-h-screen w-auto space-y-20 overflow-y-auto'>
			<HeaderAuth />
			<TermsOfServicePage />
			<div className='mx-auto max-w-7xl pb-6'>
				<FooterPublic />
			</div>
		</div>
	)
}
