import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

export async function BillingView() {
	return (
		<div className='flex flex-1 flex-col p-4 md:p-6'>
			<div className='mb-6'>
				<h1 className='text-2xl font-bold'>Facturación</h1>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Configuración de Facturación</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						<div className='space-y-2'>
							<Label htmlFor='establishment'>Establecimiento*</Label>
							<Input id='establishment' placeholder='001' maxLength={3} required />
						</div>

						<div className='space-y-2'>
							<Label htmlFor='emissionPoint'>Punto de Emisión*</Label>
							<Input id='emissionPoint' placeholder='001' maxLength={3} required />
						</div>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='printerType'>Tipo de Impresora*</Label>
						<select
							id='printerType'
							className='border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50'>
							<option value=''>Seleccione una opción</option>
							<option value='thermal'>Impresora Térmica (80mm)</option>
							<option value='invoice'>Impresora de Facturas (A4)</option>
							<option value='ticket'>Impresora de Tickets (58mm)</option>
						</select>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='printerName'>Nombre/Modelo Impresora</Label>
						<Input id='printerName' placeholder='Ej: Epson TM-T20II' />
					</div>

					<div className='flex items-center space-x-2'>
						<Switch id='printTaxes' />
						<Label htmlFor='printTaxes'>Incluir desglose de IVA 12%</Label>
					</div>

					<div className='flex items-center space-x-2'>
						<Switch id='printLegalText' />
						<Label htmlFor='printLegalText'>Imprimir texto legal SRI</Label>
					</div>

					<div className='pt-4'>
						<Button>Guardar Configuración</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
