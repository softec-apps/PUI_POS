'use client'

import { cn } from '@/lib/utils'
import React, { useState } from 'react'
import { Icons } from '@/components/icons'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface AlertMessageProps {
	variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
	title?: React.ReactNode
	message?: React.ReactNode
	className?: string
	dismissible?: boolean
	onDismiss?: () => void
}

export function AlertMessage({
	variant = 'default',
	title,
	message,
	className = '',
	dismissible = false,
	onDismiss,
}: AlertMessageProps) {
	const [isVisible, setIsVisible] = useState(true)

	const handleDismiss = () => {
		setIsVisible(false)
		onDismiss?.()
	}

	const variantConfig = {
		default: {
			container: 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700',
			text: 'text-gray-800 dark:text-gray-200',
			icon: <Icons.infoCircle className='!text-primary/80 dark:!text-primary/90 h-4 w-4' />,
			closeButton: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200',
		},
		destructive: {
			container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700',
			text: 'text-red-800 dark:text-red-200',
			icon: <Icons.alertCircle className='h-4 w-4 !text-red-700 dark:!text-red-200' />,
			closeButton: 'text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200',
		},
		success: {
			container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
			text: 'text-green-800 dark:text-green-200',
			icon: <Icons.checkCircle className='h-4 w-4 !text-green-700 dark:!text-green-200' />,
			closeButton: 'text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200',
		},
		warning: {
			container: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700',
			text: 'text-amber-800 dark:text-amber-200',
			icon: <Icons.alertTriangle className='h-4 w-4 !text-amber-700 dark:!text-amber-200' />,
			closeButton: 'text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-200',
		},
		info: {
			container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700',
			text: 'text-blue-800 dark:text-blue-200',
			icon: <Icons.infoCircle className='h-4 w-4 !text-blue-700 dark:!text-blue-200' />,
			closeButton: 'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200',
		},
	}

	const selectedVariant = variantConfig[variant]

	if (!isVisible) return null

	return (
		<Alert
			className={cn(
				'relative rounded-lg border-none px-4 py-3 [&>svg]:mt-0.5 [&>svg]:mr-3',
				selectedVariant.container,
				className
			)}>
			{dismissible && (
				<ActionButton
					variant='ghost'
					size='icon'
					onClick={handleDismiss}
					icon={<Icons.x className='h-4 w-4' />}
					className={cn('absolute top-2 right-2 h-6 w-6 rounded-full p-0', selectedVariant.closeButton)}
				/>
			)}

			{title && (
				<AlertTitle className={cn('pr-6 text-sm font-medium', selectedVariant.text)}>
					{title || 'Información'}
				</AlertTitle>
			)}
			<AlertDescription className={cn('pr-6 text-sm', selectedVariant.text)}>{message}</AlertDescription>
		</Alert>
	)
}
