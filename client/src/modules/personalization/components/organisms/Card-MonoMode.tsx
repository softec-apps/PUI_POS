'use client'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { CardHeaderInfo } from '../atoms/CardHeaderInfo'

interface CardMonoModeProps {
	isMono: boolean
	onMonoChange: (checked: boolean) => void
}

export function CardMonoMode({ isMono, onMonoChange }: CardMonoModeProps) {
	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<div className='flex items-center justify-between'>
				<CardHeaderInfo
					title={isMono ? 'Modo simple activado' : 'Modo simple'}
					description={
						isMono
							? 'La interfaz se muestra sin redondeos ni sombras'
							: 'La interfaz se muestra con redondeos y sombras'
					}
				/>

				<Switch
					id='mono-mode'
					checked={isMono}
					onCheckedChange={onMonoChange}
					className='data-[state=checked]:bg-primary cursor-pointer'
					aria-label='Toggle mono mode'
				/>
			</div>
		</Card>
	)
}
