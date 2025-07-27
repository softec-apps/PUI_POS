'use client'

import React from 'react'
import { Badge as BadgeUI } from '@/components/ui/badge'

type BadgeVariant =
	| 'success'
	| 'info'
	| 'error'
	| 'warning'
	| 'destructive'
	| 'default'
	| 'primary'
	| 'secondary'
	| 'accent'
	| 'outline'
	| 'ghost'
	| 'link'
	| 'purple'
	| 'pink'
	| 'indigo'
	| 'cyan'
	| 'teal'
	| 'orange'

interface Props {
	variant?: BadgeVariant
	text: string | React.ReactNode
	decord?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
	success:
		'bg-green-600/10 text-green-600 focus-visible:ring-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:focus-visible:ring-green-400/40 [a&]:hover:bg-green-600/5 dark:[a&]:hover:bg-green-400/5',
	info: 'bg-blue-600/10 text-blue-600 focus-visible:ring-blue-600/20 dark:bg-blue-400/10 dark:text-blue-400 dark:focus-visible:ring-blue-400/40 [a&]:hover:bg-blue-600/5 dark:[a&]:hover:bg-blue-400/5',
	warning:
		'bg-yellow-600/10 text-yellow-600 focus-visible:ring-yellow-600/20 dark:bg-yellow-400/10 dark:text-yellow-400 dark:focus-visible:ring-yellow-400/40 [a&]:hover:bg-yellow-600/5 dark:[a&]:hover:bg-yellow-400/5',
	error:
		'bg-red-600/10 text-red-600 focus-visible:ring-red-600/20 dark:bg-red-400/10 dark:text-red-400 dark:focus-visible:ring-red-400/40 [a&]:hover:bg-red-600/5 dark:[a&]:hover:bg-red-400/5',
	destructive:
		'bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/5',
	default:
		'bg-gray-600/10 text-gray-600 focus-visible:ring-gray-600/20 dark:bg-gray-400/10 dark:text-gray-300 dark:focus-visible:ring-gray-400/40 [a&]:hover:bg-gray-600/5 dark:[a&]:hover:bg-gray-400/5',
	primary:
		'bg-primary/10 text-primary focus-visible:ring-primary/20 dark:bg-primary/20 dark:text-primary-foreground dark:focus-visible:ring-primary/40 [a&]:hover:bg-primary/15 dark:[a&]:hover:bg-primary/25',
	secondary:
		'bg-secondary/10 text-secondary focus-visible:ring-secondary/20 dark:bg-secondary/20 dark:text-secondary-foreground dark:focus-visible:ring-secondary/40 [a&]:hover:bg-secondary/15 dark:[a&]:hover:bg-secondary/25',
	accent:
		'bg-accent/10 text-accent focus-visible:ring-accent/20 dark:bg-accent/20 dark:text-accent-foreground dark:focus-visible:ring-accent/40 [a&]:hover:bg-accent/15 dark:[a&]:hover:bg-accent/25',
	outline: 'bg-transparent border border-border text-foreground [a&]:hover:bg-accent/10',
	ghost: 'bg-transparent text-foreground [a&]:hover:bg-accent/10',
	link: 'bg-transparent text-primary underline-offset-4 [a&]:hover:underline',
	purple:
		'bg-purple-600/10 text-purple-600 focus-visible:ring-purple-600/20 dark:bg-purple-400/10 dark:text-purple-400 dark:focus-visible:ring-purple-400/40 [a&]:hover:bg-purple-600/5 dark:[a&]:hover:bg-purple-400/5',
	pink: 'bg-pink-600/10 text-pink-600 focus-visible:ring-pink-600/20 dark:bg-pink-400/10 dark:text-pink-400 dark:focus-visible:ring-pink-400/40 [a&]:hover:bg-pink-600/5 dark:[a&]:hover:bg-pink-400/5',
	indigo:
		'bg-indigo-600/10 text-indigo-600 focus-visible:ring-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:focus-visible:ring-indigo-400/40 [a&]:hover:bg-indigo-600/5 dark:[a&]:hover:bg-indigo-400/5',
	cyan: 'bg-cyan-600/10 text-cyan-600 focus-visible:ring-cyan-600/20 dark:bg-cyan-400/10 dark:text-cyan-400 dark:focus-visible:ring-cyan-400/40 [a&]:hover:bg-cyan-600/5 dark:[a&]:hover:bg-cyan-400/5',
	teal: 'bg-teal-600/10 text-teal-600 focus-visible:ring-teal-600/20 dark:bg-teal-400/10 dark:text-teal-400 dark:focus-visible:ring-teal-400/40 [a&]:hover:bg-teal-600/5 dark:[a&]:hover:bg-teal-400/5',
	orange:
		'bg-orange-600/10 text-orange-600 focus-visible:ring-orange-600/20 dark:bg-orange-400/10 dark:text-orange-400 dark:focus-visible:ring-orange-400/40 [a&]:hover:bg-orange-600/5 dark:[a&]:hover:bg-orange-400/5',
}

const dotColors: Record<BadgeVariant, string> = {
	success: 'bg-green-600 dark:bg-green-400',
	info: 'bg-blue-600 dark:bg-blue-400',
	warning: 'bg-yellow-600 dark:bg-yellow-400',
	error: 'bg-red-600 dark:bg-red-400',
	destructive: 'bg-destructive',
	default: 'bg-gray-600 dark:bg-gray-400',
	primary: 'bg-primary dark:bg-primary-foreground',
	secondary: 'bg-secondary dark:bg-secondary-foreground',
	accent: 'bg-accent dark:bg-accent-foreground',
	outline: 'bg-foreground',
	ghost: 'bg-foreground',
	link: 'bg-primary',
	purple: 'bg-purple-600 dark:bg-purple-400',
	pink: 'bg-pink-600 dark:bg-pink-400',
	indigo: 'bg-indigo-600 dark:bg-indigo-400',
	cyan: 'bg-cyan-600 dark:bg-cyan-400',
	teal: 'bg-teal-600 dark:bg-teal-400',
	orange: 'bg-orange-600 dark:bg-orange-400',
}

export function Badge({ variant = 'default', text, decord = false }: Props) {
	return (
		<BadgeUI className={`rounded-full border-none focus-visible:outline-none ${variantStyles[variant]}`}>
			{decord && <span className={`size-1.5 rounded-full ${dotColors[variant]}`} />}
			{text}
		</BadgeUI>
	)
}
