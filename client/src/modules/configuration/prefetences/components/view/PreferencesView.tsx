import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'

export async function PreferencesView() {
	return (
		<div className='flex flex-1 flex-col p-4 md:p-6'>
			<div className='mb-6'>
				<h1 className='text-2xl font-bold'>Preferencias</h1>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Preferencias del Sistema</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						<div className='space-y-2'>
							<Label htmlFor='ivaRate'>IVA (%)*</Label>
							<Input id='ivaRate' type='number' defaultValue='12' required />
						</div>

						<div className='space-y-2'>
							<Label htmlFor='currency'>Moneda*</Label>
							<Input id='currency' defaultValue='USD' required />
						</div>
					</div>

					<div className='flex items-center space-x-2'>
						<Switch id='showStock' />
						<Label htmlFor='showStock'>Mostrar alertas de stock</Label>
					</div>

					<div className='flex items-center space-x-2'>
						<Switch id='requireCustomer' />
						<Label htmlFor='requireCustomer'>Requerir cliente en ventas</Label>
					</div>

					<div className='pt-4'>
						<Button>Guardar Preferencias</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
