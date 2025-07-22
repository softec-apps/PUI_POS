'use client'

import * as React from 'react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { IconBrightness } from '@tabler/icons-react'

export function ModeToggle() {
	const { setTheme, resolvedTheme } = useTheme()

	const handleThemeToggle = React.useCallback(
		(e?: React.MouseEvent) => {
			const newMode = resolvedTheme === 'dark' ? 'light' : 'dark'
			const root = document.documentElement

			if (!document.startViewTransition) {
				setTheme(newMode)
				return
			}

			// Set coordinates from the click event
			if (e) {
				root.style.setProperty('--x', `${e.clientX}px`)
				root.style.setProperty('--y', `${e.clientY}px`)
			}

			document.startViewTransition(() => {
				setTheme(newMode)
			})
		},
		[resolvedTheme, setTheme]
	)

	return (
		<Button variant='secondary' size='icon' className='group/toggle' onClick={handleThemeToggle}>
			<IconBrightness />
			<span className='sr-only'>Toggle theme</span>
		</Button>
	)
}
