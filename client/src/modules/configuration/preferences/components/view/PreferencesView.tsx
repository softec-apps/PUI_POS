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
import { Typography } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import { CardHeaderInfo } from '../atoms/CardHeaderInfo'
import { Icons } from '@/components/icons'
import { TypeView } from '../organisms/TypeView'

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
		<div className='flex w-full flex-col gap-8'>
			<TypeView />

			<Separator />

			<Card className='border-none bg-transparent p-0 shadow-none'>
				<CardHeader className='p-0'>
					<CardTitle>Preferencias del Sistema</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4 p-0'>
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
