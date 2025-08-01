'use client'

import { cn } from '@/lib/utils'
import { Typography } from '@/components/ui/typography'
import { Card, CardContent } from '@/components/ui/card'

interface InfoCardProps {
	icon: React.ReactNode
	name?: string | null
	label: string
	className?: string
}

export const InfoCard = ({ icon, name, label, className }: InfoCardProps) => {
	const isEmpty = !name || name.trim() === ''

	return (
		<Card
			className={cn(
				'h-full border-none p-0 shadow-none',
				isEmpty ? 'bg-destructive/10' : 'bg-accent/50 dark:bg-card',
				className
			)}>
			<CardContent className='p-4'>
				{isEmpty ? (
					<div className='mt-2 flex h-full items-center justify-center text-center'>
						<Typography variant='error'>Sin {label.toLowerCase()}</Typography>
					</div>
				) : (
					<div className='flex items-center gap-4'>
						<div className='bg-accent-foreground/80 text-muted flex h-10 w-10 items-center justify-center rounded-lg'>
							{icon}
						</div>
						<div className='flex min-w-0 flex-col'>
							<Typography variant='h5' className='line-clamp-1 break-words'>
								{name}
							</Typography>
							<Typography variant='small'>{label}</Typography>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
