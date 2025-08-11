'use client'

import React from 'react'
import { Badge as BadgeUI } from '@/components/ui/badge'

type BadgeVariant =
	| 'default'
	| 'secondary'
	| 'destructive'
	| 'outline'
	| 'success'
	| 'warning'
	| 'info'
	| 'purple'
	| 'pink'
	| 'indigo'
	| 'cyan'
	| 'teal'
	| 'orange'

interface Props {
	variant?: BadgeVariant
	text: string | React.ReactNode
	decor?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
	// Variantes estándar de shadcn/ui
	default: 'border-transparent bg-primary text-primary-foreground',
	secondary: 'border-transparent bg-secondary text-secondary-foreground',
	destructive: 'border-transparent bg-red-100 text-red-800/80 dark:bg-red-900/20 dark:text-red-400',
	outline: 'text-foreground',

	// Variantes personalizadas con colores shadcn/ui
	success: 'border-transparent bg-green-100 text-green-800/80 dark:bg-green-900/20 dark:text-green-400',
	warning: 'border-transparent bg-yellow-100 text-yellow-800/80 dark:bg-yellow-900/20 dark:text-yellow-400',
	info: 'border-transparent bg-blue-100 text-blue-800/80 dark:bg-blue-900/20 dark:text-blue-400',
	purple: 'border-transparent bg-purple-100 text-purple-800/80 dark:bg-purple-900/20 dark:text-purple-400',
	pink: 'border-transparent bg-pink-100 text-pink-800/80 dark:bg-pink-900/20 dark:text-pink-400',
	indigo: 'border-transparent bg-indigo-100 text-indigo-800/80 dark:bg-indigo-900/20 dark:text-indigo-400',
	cyan: 'border-transparent bg-cyan-100 text-cyan-800/80 dark:bg-cyan-900/20 dark:text-cyan-400',
	teal: 'border-transparent bg-teal-100 text-teal-800/80 dark:bg-teal-900/20 dark:text-teal-400',
	orange: 'border-transparent bg-orange-100 text-orange-800/80 dark:bg-orange-900/20 dark:text-orange-400',
}

const dotColors: Record<BadgeVariant, string> = {
	default: 'bg-primary-foreground',
	secondary: 'bg-secondary-foreground',
	destructive: 'bg-destructive-foreground',
	outline: 'bg-foreground',
	success: 'bg-green-600 dark:bg-green-400',
	warning: 'bg-yellow-600 dark:bg-yellow-400',
	info: 'bg-blue-600 dark:bg-blue-400',
	purple: 'bg-purple-600 dark:bg-purple-400',
	pink: 'bg-pink-600 dark:bg-pink-400',
	indigo: 'bg-indigo-600 dark:bg-indigo-400',
	cyan: 'bg-cyan-600 dark:bg-cyan-400',
	teal: 'bg-teal-600 dark:bg-teal-400',
	orange: 'bg-orange-600 dark:bg-orange-400',
}

export function Badge({ variant = 'default', text, decor = false }: Props) {
	return (
		<BadgeUI className={`rounded-full border-none focus-visible:outline-none ${variantStyles[variant]}`}>
			{decor && <span className={`mr-1.5 size-1.5 rounded-full ${dotColors[variant]}`} />}
			{text}
		</BadgeUI>
	)
}
