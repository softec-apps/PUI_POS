import { Label } from '@/components/ui/label'
import { CardMockupTheme } from '@/modules/personalization/components/organisms/Card-MockupTheme'

export function ThemeCategorySection({
	category,
	themes,
	isScaled,
	activeTheme,
	onThemeSelect,
}: {
	category: string
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	themes: Array<any>
	isScaled: boolean
	activeTheme: string
	onThemeSelect: (themeValue: string, hasScaled: boolean) => void
}) {
	const categoryName =
		category === 'solid' ? 'Temas simples' : category === 'creative' ? 'Temas creativos' : 'Temas N/A'

	return (
		<div key={category} className='w-full space-y-4'>
			<Label>{categoryName}</Label>
			<div className='grid grid-cols-1 gap-4 pb-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
				{themes.map(theme => {
					const hasScaled = 'scaledValue' in theme
					const isActive = activeTheme === (isScaled && hasScaled ? theme.scaledValue : theme.value)

					return (
						<CardMockupTheme
							key={theme.value}
							theme={{
								name: theme.name,
								value: hasScaled && isScaled ? theme.scaledValue : theme.value,
								colors: theme.colors,
								isScaled: isScaled && hasScaled,
							}}
							isActive={isActive}
							onClick={() => onThemeSelect(theme.value, hasScaled)}
						/>
					)
				})}
			</div>
		</div>
	)
}
