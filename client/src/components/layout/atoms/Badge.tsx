'use client'

import { Badge as BadgeUI } from '@/components/ui/badge'
import React from 'react'

type BadgeVariant = 'success' | 'info' | 'error' | 'warning' | 'destructive' | 'default'

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
		'bg-gray-600/10 text-gray-600 focus-visible:ring-gray-600/20 dark:bg-gray-400/10 dark:text-gray-400 dark:focus-visible:ring-gray-400/40 [a&]:hover:bg-gray-600/5 dark:[a&]:hover:bg-gray-400/5',
}

const dotColors: Record<BadgeVariant, string> = {
	success: 'bg-green-600 dark:bg-green-400',
	info: 'bg-blue-600 dark:bg-blue-400',
	warning: 'bg-yellow-600 dark:bg-yellow-400',
	error: 'bg-red-600 dark:bg-red-400',
	destructive: 'bg-destructive',
	default: 'bg-gray-600 dark:bg-gray-400',
}

export function Badge({ variant = 'default', text, decord = true }: Props) {
	return (
		<BadgeUI className={`rounded-full border-none focus-visible:outline-none ${variantStyles[variant]}`}>
			{decord && <span className={`size-1.5 rounded-full ${dotColors[variant]}`} />}
			{text}
		</BadgeUI>
	)
}
