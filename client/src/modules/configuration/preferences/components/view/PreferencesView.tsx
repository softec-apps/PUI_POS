'use client'

import { toast } from 'sonner'
import { useState } from 'react'

import { useSystemPreferences, useViewStore } from '@/common/stores/usePreferencesStore'

import { ShoppingCart, LayoutGrid, Check, Monitor } from 'lucide-react'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PreferencesView() {
	const { preferences, updateIvaRate, updateCurrency, toggleShowStock, toggleRequireCustomer, resetPreferences } =
		useSystemPreferences()

	const { currentView, setView } = useViewStore()

	const [localIvaRate, setLocalIvaRate] = useState(preferences.ivaRate.toString())
	const [localCurrency, setLocalCurrency] = useState(preferences.currency)

	const handleSave = () => {
		const ivaRate = parseFloat(localIvaRate)

		if (isNaN(ivaRate) || ivaRate < 0 || ivaRate > 100) {
			toast.error('El IVA debe ser un número válido entre 0 y 100')
			return
		}

		if (!localCurrency.trim()) {
			toast.error('La moneda es requerida')
			return
		}

		updateIvaRate(ivaRate)
		updateCurrency(localCurrency.trim().toUpperCase())

		toast.success('Preferencias guardadas correctamente')
	}

	const handleReset = () => {
		resetPreferences()
		setLocalIvaRate('12')
		setLocalCurrency('USD')
		toast.info('Preferencias restablecidas a valores por defecto')
	}

	return (
		<div className='flex flex-1 flex-col p-4 md:p-6'>
			<div className='mb-6'>
				<h1 className='text-2xl font-bold'>Preferencias</h1>
			</div>

			{/* Card de Selección de Vista */}
			<Card className='mb-6'>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Monitor className='h-5 w-5' />
						Tipo de Vista
					</CardTitle>
				</CardHeader>

				<CardContent>
					<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
						{/* Vista POS */}
						<div
							className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
								currentView === 'pos'
									? 'border-primary bg-primary/5 shadow-sm'
									: 'border-border hover:border-primary/50'
							}`}
							onClick={() => setView('pos')}>
							{currentView === 'pos' && (
								<div className='bg-primary text-primary-foreground absolute top-2 right-2 rounded-full p-1'>
									<Check className='h-4 w-4' />
								</div>
							)}

							<div className='mb-3 flex items-center gap-3'>
								<div className='rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20'>
									<ShoppingCart className='h-5 w-5 text-blue-600 dark:text-blue-400' />
								</div>
								<h3 className='text-lg font-semibold'>V1</h3>
							</div>

							<p className='text-muted-foreground mb-4 text-sm'>
								Interfaz tradicional de punto de venta con diseño vertical y flujo optimizado para ventas rápidas.
							</p>

							{/* Mockup Vista POS */}
							<div className='space-y-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800'>
								<div className='flex gap-2'>
									<div className='flex-1 space-y-1 rounded bg-white p-2 dark:bg-gray-700'>
										<div className='h-2 w-3/4 rounded bg-gray-200 dark:bg-gray-600'></div>
										<div className='h-2 w-1/2 rounded bg-gray-200 dark:bg-gray-600'></div>
										<div className='h-2 w-2/3 rounded bg-gray-200 dark:bg-gray-600'></div>
									</div>
									<div className='w-20 rounded bg-white p-2 dark:bg-gray-700'>
										<div className='mb-1 h-8 rounded bg-blue-200 dark:bg-blue-800'></div>
										<div className='h-2 rounded bg-gray-200 dark:bg-gray-600'></div>
									</div>
								</div>
								<div className='grid grid-cols-3 gap-1'>
									<div className='h-6 rounded bg-gray-300 dark:bg-gray-600'></div>
									<div className='h-6 rounded bg-gray-300 dark:bg-gray-600'></div>
									<div className='h-6 rounded bg-gray-300 dark:bg-gray-600'></div>
								</div>
							</div>
						</div>

						{/* Vista Matriz */}
						<div
							className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md ${
								currentView === 'matriz'
									? 'border-primary bg-primary/5 shadow-sm'
									: 'border-border hover:border-primary/50'
							}`}
							onClick={() => setView('matriz')}>
							{currentView === 'matriz' && (
								<div className='bg-primary text-primary-foreground absolute top-2 right-2 rounded-full p-1'>
									<Check className='h-4 w-4' />
								</div>
							)}

							<div className='mb-3 flex items-center gap-3'>
								<div className='rounded-lg bg-green-100 p-2 dark:bg-green-900/20'>
									<LayoutGrid className='h-5 w-5 text-green-600 dark:text-green-400' />
								</div>
								<h3 className='text-lg font-semibold'>V2</h3>
							</div>

							<p className='text-muted-foreground mb-4 text-sm'>
								Diseño tipo tabla/matriz con vista amplia de productos, ideal para inventarios y gestión detallada.
							</p>

							{/* Mockup Vista Matriz */}
							<div className='space-y-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800'>
								<div className='mb-2 grid grid-cols-4 gap-1'>
									<div className='h-2 rounded bg-green-200 dark:bg-green-800'></div>
									<div className='h-2 rounded bg-green-200 dark:bg-green-800'></div>
									<div className='h-2 rounded bg-green-200 dark:bg-green-800'></div>
									<div className='h-2 rounded bg-green-200 dark:bg-green-800'></div>
								</div>
								<div className='space-y-1'>
									<div className='grid grid-cols-4 gap-1'>
										<div className='h-3 rounded bg-white dark:bg-gray-700'></div>
										<div className='h-3 rounded bg-white dark:bg-gray-700'></div>
										<div className='h-3 rounded bg-white dark:bg-gray-700'></div>
										<div className='h-3 rounded bg-white dark:bg-gray-700'></div>
									</div>
									<div className='grid grid-cols-4 gap-1'>
										<div className='h-3 rounded bg-white dark:bg-gray-700'></div>
										<div className='h-3 rounded bg-white dark:bg-gray-700'></div>
										<div className='h-3 rounded bg-white dark:bg-gray-700'></div>
										<div className='h-3 rounded bg-white dark:bg-gray-700'></div>
									</div>
									<div className='grid grid-cols-4 gap-1'>
										<div className='h-3 rounded bg-white dark:bg-gray-700'></div>
										<div className='h-3 rounded bg-white dark:bg-gray-700'></div>
										<div className='h-3 rounded bg-white dark:bg-gray-700'></div>
										<div className='h-3 rounded bg-white dark:bg-gray-700'></div>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className='mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20'>
						<p className='text-sm text-blue-800 dark:text-blue-200'>
							<strong>Vista actual:</strong> {currentView === 'pos' ? 'POS' : 'Matriz'} - Los cambios se aplicarán
							inmediatamente en el sistema de punto de venta.
						</p>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Preferencias del Sistema</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						<div className='space-y-2'>
							<Label htmlFor='ivaRate'>IVA (%)*</Label>
							<Input
								id='ivaRate'
								type='number'
								min='0'
								max='100'
								step='0.01'
								value={localIvaRate}
								onChange={e => setLocalIvaRate(e.target.value)}
								required
							/>
						</div>
						<div className='space-y-2'>
							<Label htmlFor='currency'>Moneda*</Label>
							<Input
								id='currency'
								value={localCurrency}
								onChange={e => setLocalCurrency(e.target.value)}
								placeholder='USD, EUR, etc.'
								required
							/>
						</div>
					</div>

					<div className='flex items-center space-x-2'>
						<Switch id='showStock' checked={preferences.showStock} onCheckedChange={toggleShowStock} />
						<Label htmlFor='showStock'>Mostrar alertas de stock</Label>
					</div>

					<div className='flex items-center space-x-2'>
						<Switch
							id='requireCustomer'
							checked={preferences.requireCustomer}
							onCheckedChange={toggleRequireCustomer}
						/>
						<Label htmlFor='requireCustomer'>Requerir cliente en ventas</Label>
					</div>

					<div className='flex gap-2 pt-4'>
						<Button onClick={handleSave}>Guardar Preferencias</Button>
						<Button variant='outline' onClick={handleReset}>
							Restablecer
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
