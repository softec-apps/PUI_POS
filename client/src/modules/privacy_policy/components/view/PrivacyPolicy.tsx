import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'

export async function PrivacyPolicyView() {
	return (
		<main className='container mx-auto max-w-3xl px-4 py-10'>
			<Card>
				<CardContent className='space-y-6 py-6'>
					<h1 className='text-3xl font-bold'>Política de Privacidad</h1>

					<Separator />

					<section>
						<h2 className='mb-2 text-xl font-semibold'>Propósito de la Política de Privacidad</h2>
						<p className='text-muted-foreground'>
							Esta política de privacidad tiene como objetivo garantizar que la información recopilada a través de
							nuestro sistema de punto de venta (POS) sea manejada de manera responsable y segura.
						</p>
					</section>

					<section>
						<h2 className='mb-2 text-xl font-semibold'>Introducción</h2>
						<p className='text-muted-foreground'>
							Esta política de privacidad describe cómo manejamos la información en nuestro sistema de punto de venta
							(POS).
						</p>
					</section>

					<section>
						<h2 className='mb-2 text-xl font-semibold'>Información Recopilada</h2>
						<p className='text-muted-foreground'>
							Recopilamos datos como transacciones, información de clientes y detalles de productos para garantizar un
							funcionamiento eficiente del sistema POS.
						</p>
					</section>
				</CardContent>
			</Card>
		</main>
	)
}
