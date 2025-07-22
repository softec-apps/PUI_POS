import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'

const terms = {
	sections: {
		introduction: {
			title: 'Introducción',
			content:
				'Estos términos y condiciones rigen el uso de nuestro sistema de punto de venta (POS). Al utilizar este sistema, aceptas cumplir con estos términos.',
		},
		usage: {
			title: 'Uso del Sistema',
			content:
				'El sistema POS está diseñado para facilitar las transacciones comerciales. Está prohibido utilizarlo para actividades fraudulentas o ilegales.',
		},
		privacy: {
			title: 'Privacidad de Datos',
			content:
				'Nos comprometemos a proteger la información de los usuarios. Consulta nuestra política de privacidad para más detalles.',
		},
		liability: {
			title: 'Limitación de Responsabilidad',
			content: 'No nos hacemos responsables de pérdidas derivadas del uso incorrecto del sistema POS.',
		},
	},
}

export async function TermsOfServicePage() {
	return (
		<main className='container mx-auto max-w-3xl px-4 py-10'>
			<Card>
				<CardContent className='space-y-6 py-6'>
					<h1 className='text-3xl font-bold'>Términos y Condiciones</h1>

					<Separator />

					{Object.entries(terms.sections).map(([key, section]) => (
						<section key={key}>
							<h2 className='mb-2 text-xl font-semibold'>{section.title}</h2>
							<p className='text-muted-foreground'>{section.content}</p>
						</section>
					))}
				</CardContent>
			</Card>
		</main>
	)
}
