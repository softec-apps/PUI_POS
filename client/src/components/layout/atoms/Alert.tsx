'use client'

import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface AlertMessageProps {
	variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
	title?: string
	message: string
	className?: string
}

export function AlertMessage({ variant = 'default', title, message, className = '' }: AlertMessageProps) {
	const variantConfig = {
		default: {
			container: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700',
			text: 'text-gray-800 dark:text-gray-200',
			icon: <Icons.infoCircle className='!text-primary/80 dark:!text-primary/90 h-4 w-4' />,
		},
		destructive: {
			container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700',
			text: 'text-red-800 dark:text-red-200',
			icon: <Icons.alertCircle className='h-4 w-4 !text-red-700 dark:!text-red-200' />,
		},
		success: {
			container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
			text: 'text-green-800 dark:text-green-200',
			icon: <Icons.checkCircle className='h-4 w-4 !text-green-700 dark:!text-green-200' />,
		},
		warning: {
			container: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700',
			text: 'text-amber-800 dark:text-amber-200',
			icon: <Icons.alertTriangle className='h-4 w-4 !text-amber-700 dark:!text-amber-200' />,
		},
		info: {
			container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
			text: 'text-blue-800 dark:text-blue-200',
			icon: <Icons.infoCircle className='h-4 w-4 !text-blue-700 dark:!text-blue-200' />,
		},
	}

	const selectedVariant = variantConfig[variant]

	return (
		<Alert
			className={cn(
				'rounded-lg border-none px-4 py-3 [&>svg]:mt-0.5 [&>svg]:mr-3',
				selectedVariant.container,
				className
			)}>
			<AlertTitle className={cn('text-sm font-medium', selectedVariant.text)}>{title || 'Información'}</AlertTitle>
			<AlertDescription className={cn('text-sm', selectedVariant.text)}>{message}</AlertDescription>
		</Alert>
	)
}
