'use client'

import { ReactElement } from 'react'
import { Typography } from '@/components/ui/typography'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
	title: string
	value: string | number
	icon?: ReactElement
	footerText?: string
	footerIcon?: ReactElement
	variant?: 'success' | 'destructive' | 'default'
}

export function StatCard({ title, value, icon, footerText, footerIcon, variant = 'default' }: StatCardProps) {
	const variantColor = {
		success: 'text-emerald-500 dark:text-emerald-400',
		destructive: 'text-destructive',
		default: 'text-muted-foreground',
	}[variant]

	const gradientBg = {
		success: 'from-emerald-300/10 to-card dark:from-emerald-300/15',
		destructive: 'from-destructive/10 to-card dark:from-destructive/15',
		default: 'from-primary/5 to-card dark:from-popover',
	}[variant]

	return (
		<Card data-slot='card' className={cn('@container/card bg-gradient-to-t pt-3', gradientBg)}>
			<CardHeader>
				<div className='mt-2 flex items-center justify-between pb-1'>
					<CardDescription>{title}</CardDescription>
					{icon && <div className='text-primary'>{icon}</div>}
				</div>
				<CardTitle className='font-mono text-2xl @[250px]/card:text-2xl'>{value}</CardTitle>
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
