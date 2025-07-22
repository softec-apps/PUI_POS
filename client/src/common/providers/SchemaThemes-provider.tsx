'use client'

import { ReactNode, createContext, useContext, useEffect, useState } from 'react'

const DEFAULT_THEME = 'default'
const COOKIE_NAME = 'active_theme'

function setThemeCookie(theme: string) {
	if (typeof window === 'undefined') return
	document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax; ${
		window.location.protocol === 'https:' ? 'Secure;' : ''
	}`
}

// Utility functions for theme parsing
function parseTheme(theme: string) {
	const isScaled = theme.includes('-scaled')
	const isMono = theme.includes('-mono')
	const baseTheme = theme.replace('-scaled', '').replace('-mono', '')

	return {
		baseTheme,
		isScaled,
		isMono,
		modifiers: {
			scaled: isScaled,
			mono: isMono,
		},
	}
}

function buildThemeClassName(theme: string) {
	const { baseTheme, isScaled, isMono } = parseTheme(theme)

	const classes = [`theme-${baseTheme}`]

	if (isScaled) classes.push('theme-scaled')
	if (isMono) classes.push('theme-mono')

	return classes
}

type ThemeContextType = {
	activeTheme: string
	setActiveTheme: (theme: string) => void
	// Helper methods for easier theme manipulation
	themeInfo: {
		baseTheme: string
		isScaled: boolean
		isMono: boolean
		modifiers: {
			scaled: boolean
			mono: boolean
		}
	}
	toggleScaled: () => void
	toggleMono: () => void
	setBaseTheme: (baseTheme: string, preserveModifiers?: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function SchemaAthemesProvider({ children, initialTheme }: { children: ReactNode; initialTheme?: string }) {
	const [activeTheme, setActiveTheme] = useState<string>(() => initialTheme || DEFAULT_THEME)

	// Parse current theme info
	const themeInfo = parseTheme(activeTheme)

	// Helper function to toggle scaled modifier
	const toggleScaled = () => {
		const { baseTheme, isMono, isScaled } = parseTheme(activeTheme)
		let newTheme = baseTheme
		if (!isScaled) newTheme += '-scaled'
		if (isMono) newTheme += '-mono'
		setActiveTheme(newTheme)
	}

	// Helper function to toggle mono modifier
	const toggleMono = () => {
		const { baseTheme, isScaled, isMono } = parseTheme(activeTheme)
		let newTheme = baseTheme
		if (isScaled) newTheme += '-scaled'
		if (!isMono) newTheme += '-mono'
		setActiveTheme(newTheme)
	}

	// Helper function to change base theme while optionally preserving modifiers
	const setBaseTheme = (baseTheme: string, preserveModifiers: boolean = true) => {
		if (!preserveModifiers) {
			setActiveTheme(baseTheme)
			return
		}

		const { isScaled, isMono } = parseTheme(activeTheme)
		let newTheme = baseTheme
		if (isScaled) newTheme += '-scaled'
		if (isMono) newTheme += '-mono'
		setActiveTheme(newTheme)
	}

	useEffect(() => {
		// Set cookie
		setThemeCookie(activeTheme)

		// Remove all existing theme classes
		const existingThemeClasses = Array.from(document.body.classList).filter(
			className => className.startsWith('theme-') || className === 'theme-scaled' || className === 'theme-mono'
		)

		existingThemeClasses.forEach(className => {
			document.body.classList.remove(className)
		})

		// Add new theme classes
		const newClasses = buildThemeClassName(activeTheme)
		newClasses.forEach(className => {
			document.body.classList.add(className)
		})

		// Optional: Log theme change for debugging
		if (process.env.NODE_ENV === 'development') {
			console.log('Theme changed:', {
				activeTheme,
				appliedClasses: newClasses,
				themeInfo: parseTheme(activeTheme),
			})
		}
	}, [activeTheme])

	const contextValue: ThemeContextType = {
		activeTheme,
		setActiveTheme,
		themeInfo,
		toggleScaled,
		toggleMono,
		setBaseTheme,
	}

	return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

export function useThemeConfig() {
	const context = useContext(ThemeContext)
	if (context === undefined) throw new Error('useThemeConfig must be used within a SchemaAthemesProvider')
	return context
}

// Additional utility hooks for specific use cases
export function useThemeModifiers() {
	const { themeInfo, toggleScaled, toggleMono } = useThemeConfig()
	return {
		isScaled: themeInfo.isScaled,
		isMono: themeInfo.isMono,
		toggleScaled,
		toggleMono,
	}
}

export function useBaseTheme() {
	const { themeInfo, setBaseTheme } = useThemeConfig()
	return {
		baseTheme: themeInfo.baseTheme,
		setBaseTheme,
	}
}
