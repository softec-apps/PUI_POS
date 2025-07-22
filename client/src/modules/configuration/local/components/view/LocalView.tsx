import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export async function LocalView() {
	return (
		<div className='flex flex-1 flex-col p-4 md:p-6'>
			<div className='mb-6'>
				<h1 className='text-2xl font-bold'>Local</h1>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Datos del Establecimiento</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						<div className='space-y-2'>
							<Label htmlFor='businessName'>Razón Social*</Label>
							<Input id='businessName' placeholder='Ej: COMERCIAL XYZ S.A.' required />
						</div>

						<div className='space-y-2'>
							<Label htmlFor='ruc'>RUC*</Label>
							<Input id='ruc' placeholder='Ej: 1790012345001' pattern='[0-9]{13}' maxLength={13} required />
						</div>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='commercialName'>Nombre Comercial</Label>
						<Input id='commercialName' placeholder='Ej: TIENDA XYZ' />
					</div>

					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						<div className='space-y-2'>
							<Label htmlFor='address'>Dirección Matriz*</Label>
							<Input id='address' placeholder='Av. Principal y Secundaria' required />
						</div>

						<div className='space-y-2'>
							<Label htmlFor='branchAddress'>Dirección Sucursal (opcional)</Label>
							<Input id='branchAddress' placeholder='Calle Ejemplo 123 y Otra' />
						</div>
					</div>

					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						<div className='space-y-2'>
							<Label htmlFor='phone'>Teléfono*</Label>
							<Input id='phone' placeholder='Ej: 022222222' required />
						</div>

						<div className='space-y-2'>
							<Label htmlFor='email'>Email</Label>
							<Input id='email' type='email' placeholder='contacto@empresa.com' />
						</div>
					</div>

					<div className='space-y-2'>
						<Label htmlFor='activity'>Actividad Económica*</Label>
						<Input id='activity' placeholder='Ej: COMERCIO AL POR MENOR' required />
					</div>

					<div className='pt-4'>
						<Button className='w-full md:w-auto'>Guardar Datos del Local</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
