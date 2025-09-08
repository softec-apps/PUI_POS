'use client'

import { ReactNode } from 'react'
import CountUp from 'react-countup'
import { Icons } from '@/components/icons'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/layout/atoms/Badge'
import { Typography } from '@/components/ui/typography'
import { formatPrice } from '@/common/utils/formatPrice-util'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface KPICardProps {
	title: string
	value: string | number
	description?: string
	growth?: number | undefined
	isCurrency?: boolean
	isLoading?: boolean
	enableAnimation?: boolean
	animationDuration?: number
	animationDelay?: number
}

export const KPICard = ({
	title,
	value,
	description,
	growth,
	isCurrency = false,
	isLoading = false,
	animationDuration = 0.3,
	animationDelay = 0.1,
}: KPICardProps) => {
	const hasValidGrowth = growth !== undefined && growth !== null && !isNaN(growth) && isFinite(growth)
	const isPositive = hasValidGrowth && growth >= 0

	if (isLoading) {
		return (
			<Card className='dark:bg-popover bg-muted/50 border-border/50'>
				<CardHeader className='pb-2'>
					<div className='flex items-center justify-between'>
						<Skeleton className='h-4 w-24' />
						<Skeleton className='h-4 w-10' />
					</div>
					<Skeleton className='mt-2 h-5 w-32' />
				</CardHeader>
				<CardFooter>
					<Skeleton className='h-5 w-full' />
				</CardFooter>
			</Card>
		)
	}

	// Función para obtener el valor numérico
	const getNumericValue = (): number => {
		if (typeof value === 'number') return value
		if (typeof value === 'string') {
			const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''))
			return isNaN(parsed) ? 0 : parsed
		}
		return 0
	}

	// Función para formatear el valor final
	const formatDisplayValue = (val: number): string => {
		if (isCurrency) return formatPrice(val)
		return val.toLocaleString('es-EC')
	}

	const formatGrowthText = (): string => {
		if (!hasValidGrowth) return 'Sin datos'
		if (growth === 0) return '0.0%'
		return `${Math.abs(growth).toFixed(1)}%`
	}

	const getGrowthBadgeVariant = () => {
		if (!hasValidGrowth) return 'outline'
		if (growth === 0) return 'secondary'
		return isPositive ? 'success' : 'destructive'
	}

	const getGrowthIcon = (): ReactNode => {
		if (!hasValidGrowth || growth === 0) return null
		return isPositive ? <Icons.trendingUp className='mr-1 h-3 w-3' /> : <Icons.trendingDown className='mr-1 h-3 w-3' />
	}

	// Renderizar el valor con CountUp
	const renderAnimatedValue = (): ReactNode => {
		const numericValue = getNumericValue()

		return (
			<CountUp
				start={0}
				end={numericValue}
				duration={animationDuration}
				delay={animationDelay}
				preserveValue
				formattingFn={formatDisplayValue}
			/>
		)
	}

	return (
		<Card className='dark:bg-popover bg-muted/50 border-border/50'>
			<CardHeader>
				<CardDescription className='flex items-center justify-between text-xs'>
					{title}
					{hasValidGrowth && (
						<Badge
							variant={getGrowthBadgeVariant()}
							text={
								<>
									{getGrowthIcon()}
									{formatGrowthText()}
								</>
							}
						/>
					)}
				</CardDescription>

				<CardTitle className='pt-2 text-xl font-medium tabular-nums'>
					<Typography variant='h5' className='font-bold'>
						{/* Aquí está la corrección principal */}
						{isCurrency ? <>${renderAnimatedValue()}</> : renderAnimatedValue()}
					</Typography>
				</CardTitle>
			</CardHeader>

			<CardFooter>
				<span className='text-muted-foreground truncate text-xs'>{description}</span>
			</CardFooter>
		</Card>
	)
}
