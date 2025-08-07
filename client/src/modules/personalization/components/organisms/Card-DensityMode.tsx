import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { CardHeaderInfo } from '@/modules/personalization/components/atoms/CardHeaderInfo'

export function CardDensityMode({
	isScaled,
	onScaledChange,
}: {
	isScaled: boolean
	onScaledChange: (checked: boolean) => void
}) {
	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<div className='flex items-center justify-between'>
				<CardHeaderInfo
					title='Modo de alta densidad'
					description='Ideal para pantallas pequeñas o cuando necesitas maximizar el espacio. Reduce los paddings y márgenes para mostrar más contenido.'
				/>

				<Switch
					id='scaled-mode'
					checked={isScaled}
					onCheckedChange={onScaledChange}
					className='data-[state=checked]:bg-primary cursor-pointer'
					aria-label='Toggle mono density'
				/>
			</div>
		</Card>
	)
}
