'use client'
import { useThemeConfig } from '@/common/providers/SchemaThemes-provider'
import { THEMES } from '@/modules/personalization/utils/colors'
import { CardDensityMode } from '@/modules/personalization/components/organisms/Card-DensityMode'
import { ThemeSelectorCard } from '@/modules/personalization/components/organisms/ThemeSelector'
import { ThemeCategorySection } from '@/modules/personalization/components/organisms/ThemeCategory'
import { Typography } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import { CardHeaderInfo } from '@/modules/personalization/components/atoms/CardHeaderInfo'
import { CardMonoMode } from '@/modules/personalization/components/organisms/Card-MonoMode'

export function ThemeSelector() {
	// Use the enhanced provider with built-in helpers
	const { activeTheme, themeInfo, toggleScaled, toggleMono, setBaseTheme } = useThemeConfig()

	// Get current state from provider
	const { isScaled, isMono, baseTheme } = themeInfo

	// Handle color theme change (gruvbox, nord, etc.)
	const handleColorThemeChange = (themeValue: string, hasScaled: boolean, hasMono: boolean) =>
		setBaseTheme(themeValue, true)

	// Handle scaled density toggle - use provider helper
	const handleScaledToggle = () => toggleScaled()

	// Handle mono toggle - use provider helper
	const handleMonoToggle = () => toggleMono()

	return (
		<div className='flex w-full flex-col gap-8'>
			<Typography variant='h3' className='font-bold'>
				Personalización
			</Typography>

			<CardDensityMode isScaled={isScaled} onScaledChange={handleScaledToggle} />

			<Separator />

			<CardMonoMode isMono={isMono} onMonoChange={handleMonoToggle} />

			<Separator />

			<ThemeSelectorCard />

			<Separator />

			<div className='space-y-6'>
				<CardHeaderInfo
					title='Esquema de color'
					description='Dale a tu aplicación un toque personal. Elige entre nuestros temas cuidadosamente diseñados o ajusta la densidad de contenido para adaptarlo a tu estilo. Los cambios se aplicarán instantáneamente.'
				/>

				{Object.entries(THEMES).map(([category, themes]) => (
					<ThemeCategorySection
						key={category}
						category={category}
						themes={themes}
						isScaled={isScaled}
						isMono={isMono}
						activeTheme={activeTheme}
						onThemeSelect={handleColorThemeChange}
					/>
				))}
			</div>
		</div>
	)
}
