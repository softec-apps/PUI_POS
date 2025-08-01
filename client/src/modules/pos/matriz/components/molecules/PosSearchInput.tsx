'use client'

import React, { useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Icons } from '@/components/icons'
import { Search, ShoppingCart, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface PosSearchInputProps {
	value: string
	onChange: (value: string) => void
	onClear: () => void
	onEnter?: () => void
	placeholder?: string
	isLoading?: boolean
	canAutoAdd?: boolean
	matchedProduct?: {
		name: string
		code: string
		price: number
	} | null
	autoAddDelay?: number
	className?: string
}

export const PosSearchInput: React.FC<PosSearchInputProps> = ({
	value,
	onChange,
	onClear,
	onEnter,
	placeholder = 'Buscar por código o nombre...',
	isLoading = false,
	canAutoAdd = false,
	matchedProduct = null,
	autoAddDelay = 2,
	className,
}) => {
	const inputRef = useRef<HTMLInputElement>(null)
	const [countdown, setCountdown] = React.useState<number>(0)

	// Auto-focus input on mount
	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus()
		}
	}, [])

	// Countdown for auto-add
	useEffect(() => {
		let interval: NodeJS.Timeout | null = null

		if (canAutoAdd && matchedProduct) {
			setCountdown(autoAddDelay)
			interval = setInterval(() => {
				setCountdown(prev => {
					if (prev <= 1) {
						if (interval) clearInterval(interval)
						return 0
					}
					return prev - 1
				})
			}, 1000)
		} else {
			setCountdown(0)
			if (interval) clearInterval(interval)
		}

		return () => {
			if (interval) clearInterval(interval)
		}
	}, [canAutoAdd, matchedProduct, autoAddDelay])

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			onEnter?.()
		}

		// Quick clear with Escape
		if (e.key === 'Escape') {
			e.preventDefault()
			onClear()
		}
	}

	return (
		<div className={cn('space-y-2', className)}>
			{/* Search Input */}
			<div className='relative'>
				<Search className='text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform' />

				<Input
					ref={inputRef}
					value={value}
					onChange={e => onChange(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className={cn(
						'bg-card h-12 border-2 pr-12 pl-12 font-mono text-base shadow-sm',
						'focus:border-primary transition-colors',
						canAutoAdd && 'border-green-400 focus:border-green-500'
					)}
					autoComplete='off'
					spellCheck={false}
					disabled={isLoading}
				/>

				{/* Loading indicator */}
				{isLoading && (
					<div className='absolute top-1/2 right-12 -translate-y-1/2'>
						<Icons.spinner className='text-muted-foreground h-4 w-4 animate-spin' />
					</div>
				)}

				{/* Clear button */}
				{value && !isLoading && (
					<ActionButton
						onClick={onClear}
						icon={<Icons.x />}
						variant='secondary'
						size='sm'
						className='text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded-full'
					/>
				)}
			</div>

			{/* Auto-add indicator */}
			{canAutoAdd && matchedProduct && (
				<div className='flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/20'>
					<div className='flex items-center gap-3'>
						<div className='rounded-full bg-green-100 p-1 dark:bg-green-900/30'>
							<ShoppingCart className='h-4 w-4 text-green-600 dark:text-green-400' />
						</div>
						<div>
							<p className='text-sm font-medium text-green-800 dark:text-green-200'>{matchedProduct.name}</p>
							<div className='flex items-center gap-2 text-xs text-green-600 dark:text-green-400'>
								<span>{matchedProduct.code}</span>
								<span>•</span>
								<span>${matchedProduct.price.toFixed(2)}</span>
							</div>
						</div>
					</div>

					{countdown > 0 && (
						<Badge variant='outline' className='border-green-300 bg-green-100 text-green-800'>
							<Clock className='mr-1 h-3 w-3' />
							{countdown}s
						</Badge>
					)}
				</div>
			)}

			{/* Help text */}
			{!value && (
				<p className='text-muted-foreground px-1 text-xs'>
					💡 Ingresa el código del producto para agregar automáticamente
				</p>
			)}
		</div>
	)
}
