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
	variant?: BadgeVariant | React.ReactNode
	text: string | React.ReactNode
	decor?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
	// Variantes estándar de shadcn/ui
	default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
	secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
	destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
	outline: 'text-foreground',

	// Variantes personalizadas con colores shadcn/ui
	success:
		'border-transparent bg-green-100 text-green-800 hover:bg-green-100/80 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30',
	warning:
		'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30',
	info: 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30',
	purple:
		'border-transparent bg-purple-100 text-purple-800 hover:bg-purple-100/80 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30',
	pink: 'border-transparent bg-pink-100 text-pink-800 hover:bg-pink-100/80 dark:bg-pink-900/20 dark:text-pink-400 dark:hover:bg-pink-900/30',
	indigo:
		'border-transparent bg-indigo-100 text-indigo-800 hover:bg-indigo-100/80 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/30',
	cyan: 'border-transparent bg-cyan-100 text-cyan-800 hover:bg-cyan-100/80 dark:bg-cyan-900/20 dark:text-cyan-400 dark:hover:bg-cyan-900/30',
	teal: 'border-transparent bg-teal-100 text-teal-800 hover:bg-teal-100/80 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30',
	orange:
		'border-transparent bg-orange-100 text-orange-800 hover:bg-orange-100/80 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30',
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
