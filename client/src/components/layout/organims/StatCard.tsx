'use client'

import { cn } from '@/lib/utils'
import { ReactElement } from 'react'
import { Typography } from '@/components/ui/typography'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'

interface StatCardProps {
	title: string
	value: string | number
	icon?: ReactElement
	footerText?: string
	footerIcon?: ReactElement
	variant?:
		| 'success'
		| 'destructive'
		| 'default'
		| 'info'
		| 'warning'
		| 'neutral'
		| 'primary'
		| 'secondary'
		| 'purple'
		| 'pink'
		| 'indigo'
		| 'teal'
		| 'orange'
		| 'lime'
		| 'fuchsia'
		| 'amber'
}

export function StatCard({ title, value, icon, footerText, footerIcon, variant = 'default' }: StatCardProps) {
	const variantColor = {
		info: 'text-blue-500 dark:text-blue-400',
		warning: 'text-amber-500 dark:text-amber-400',
		success: 'text-emerald-500 dark:text-emerald-400',
		destructive: 'text-destructive dark:text-destructive',
		default: 'text-muted-foreground',
		neutral: 'text-neutral-500 dark:text-neutral-400',
		primary: 'text-primary dark:text-primary',
		secondary: 'text-secondary dark:text-secondary',
		purple: 'text-purple-500 dark:text-purple-400',
		pink: 'text-pink-500 dark:text-pink-400',
		indigo: 'text-indigo-500 dark:text-indigo-400',
		teal: 'text-teal-500 dark:text-teal-400',
		orange: 'text-orange-500 dark:text-orange-400',
		lime: 'text-lime-500 dark:text-lime-400',
		fuchsia: 'text-fuchsia-500 dark:text-fuchsia-400',
		amber: 'text-amber-500 dark:text-amber-400',
	}[variant]

	const gradientBg = {
		info: 'from-blue-300/10 to-card dark:from-blue-300/15',
		warning: 'from-amber-300/10 to-card dark:from-amber-300/15',
		success: 'from-emerald-300/10 to-card dark:from-emerald-300/15',
		destructive: 'from-destructive/10 to-card dark:from-destructive/15',
		default: 'from-primary/5 to-card dark:from-popover',
		neutral: 'from-neutral-300/10 to-card dark:from-neutral-300/15',
		primary: 'from-primary/10 to-card dark:from-primary/15',
		secondary: 'from-secondary/10 to-card dark:from-secondary/15',
		purple: 'from-purple-300/10 to-card dark:from-purple-300/15',
		pink: 'from-pink-300/10 to-card dark:from-pink-300/15',
		indigo: 'from-indigo-300/10 to-card dark:from-indigo-300/15',
		teal: 'from-teal-300/10 to-card dark:from-teal-300/15',
		orange: 'from-orange-300/10 to-card dark:from-orange-300/15',
		lime: 'from-lime-300/10 to-card dark:from-lime-300/15',
		fuchsia: 'from-fuchsia-300/10 to-card dark:from-fuchsia-300/15',
		amber: 'from-amber-300/10 to-card dark:from-amber-300/15',
	}[variant]

	return (
		<Card data-slot='card' className={cn('@container/card bg-gradient-to-t pt-3', gradientBg)}>
			<CardHeader>
				<div className='mt-2 flex items-center justify-between pb-1'>
					<CardDescription className={cn('text-sm', variantColor)}>{title}</CardDescription>
					{icon && <div className={cn('', variantColor)}>{icon}</div>}
				</div>
				<CardTitle className={cn('text-xl font-medium tabular-nums @[250px]/card:text-2xl', variantColor)}>
					{value}
				</CardTitle>
			</CardHeader>

			{footerText && (
				<CardFooter className='relative z-10 flex-col items-start gap-1.5 text-sm'>
					<div className={cn('flex items-center gap-2 text-sm font-medium', variantColor)}>
						<Typography variant='span' className='text-sm'>
							{footerText}
						</Typography>
						{footerIcon && <span className='flex items-center'>{footerIcon}</span>}
					</div>
				</CardFooter>
			)}
		</Card>
	)
}
