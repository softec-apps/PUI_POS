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
	| 'amber'
	| 'gray'

interface Props {
	variant?: BadgeVariant
	text: string | React.ReactNode
	decor?: boolean
	icon?: React.ReactNode
}

const variantStyles: Record<BadgeVariant, string> = {
	default: 'border-transparent bg-primary text-primary-foreground',
	secondary: 'border-transparent bg-secondary text-secondary-foreground',
	destructive: 'border-transparent bg-red-100 text-red-600 dark:bg-red-700/20 dark:text-red-300',
	outline: 'text-foreground/80 bg-transparent border dark:border-muted border-primary/40',
	success: 'border-transparent bg-green-100 text-green-600 dark:bg-green-700/20 dark:text-green-300',
	warning: 'border-transparent bg-yellow-100 text-yellow-600 dark:bg-yellow-700/20 dark:text-yellow-300',
	info: 'border-transparent bg-blue-100 text-blue-600 dark:bg-blue-700/20 dark:text-blue-300',
	purple: 'border-transparent bg-purple-100 text-purple-600 dark:bg-purple-700/20 dark:text-purple-300',
	pink: 'border-transparent bg-pink-100 text-pink-600 dark:bg-pink-700/20 dark:text-pink-300',
	indigo: 'border-transparent bg-indigo-100 text-indigo-600 dark:bg-indigo-700/20 dark:text-indigo-300',
	cyan: 'border-transparent bg-cyan-100 text-cyan-600 dark:bg-cyan-700/20 dark:text-cyan-300',
	teal: 'border-transparent bg-teal-100 text-teal-600 dark:bg-teal-700/20 dark:text-teal-300',
	orange: 'border-transparent bg-orange-100 text-orange-600 dark:bg-orange-700/20 dark:text-orange-300',
	amber: 'border-transparent bg-amber-100 text-amber-600 dark:bg-amber-700/20 dark:text-amber-300',
	gray: 'border-transparent bg-gray-100 text-gray-600 dark:bg-gray-700/20 dark:text-gray-300',
}

const dotColors: Record<BadgeVariant, string> = {
	default: 'bg-primary-foreground',
	secondary: 'bg-secondary-foreground',
	destructive: 'bg-destructive-foreground',
	outline: 'bg-foreground',
	success: 'bg-green-600 dark:bg-green-300',
	warning: 'bg-yellow-600 dark:bg-yellow-300',
	info: 'bg-blue-600 dark:bg-blue-300',
	purple: 'bg-purple-600 dark:bg-purple-300',
	pink: 'bg-pink-600 dark:bg-pink-300',
	indigo: 'bg-indigo-600 dark:bg-indigo-300',
	cyan: 'bg-cyan-600 dark:bg-cyan-300',
	teal: 'bg-teal-600 dark:bg-teal-300',
	orange: 'bg-orange-600 dark:bg-orange-300',
	amber: 'bg-amber-600 dark:bg-amber-300',
	gray: 'bg-gray-600 dark:bg-gray-300',
}

export function Badge({ variant = 'default', text, decor = false, icon }: Props) {
	return (
		<BadgeUI className={`flex items-center gap-1 rounded-full focus-visible:outline-none ${variantStyles[variant]}`}>
			{icon && <div>{icon}</div>}
			{decor && <span className={`mr-0.5 size-1.5 rounded-full ${dotColors[variant]}`} />}
			{text}
		</BadgeUI>
	)
}
