'use client'
import { useThemeConfig } from '@/common/providers/SchemaThemes-provider'
import { THEMES } from '@/modules/configuration/personalization/utils/colors'
import { CardDensityMode } from '@/modules/configuration/personalization/components/organisms/Card-DensityMode'
import { ThemeSelectorCard } from '@/modules/configuration/personalization/components/organisms/ThemeSelector'
import { ThemeCategorySection } from '@/modules/configuration/personalization/components/organisms/ThemeCategory'
import { Typography } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import { CardHeaderInfo } from '../atoms/CardHeaderInfo'
import { CardMonoMode } from '../organisms/Card-MonoMode'

export function ThemeSelector() {
	// Use the enhanced provider with built-in helpers
	const { activeTheme, themeInfo, toggleScaled, toggleMono, setBaseTheme } = useThemeConfig()

	// Get current state from provider
	const { isScaled, isMono, baseTheme } = themeInfo

	// Check if a theme supports a specific modifier
	const themeSupportsModifier = (baseTheme: string, modifier: 'scaled' | 'mono') => {
		const allThemes = THEMES.solid.concat(THEMES.creative)
		return allThemes.some(t => t.value === baseTheme)
	}

	// Handle color theme change (gruvbox, nord, etc.)
	const handleColorThemeChange = (themeValue: string, hasScaled: boolean, hasMono: boolean) => {
		// Use the provider's helper to preserve modifiers when possible
		setBaseTheme(themeValue, true)
	}

	// Handle scaled density toggle - use provider helper
	const handleScaledToggle = () => {
		toggleScaled()
	}

	// Handle mono toggle - use provider helper
	const handleMonoToggle = () => {
		toggleMono()
	}

	return (
		<div className='flex w-full flex-col gap-8'>
			<div className='pb-8'>
				<Typography variant='h1'>Personalización</Typography>
			</div>

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
