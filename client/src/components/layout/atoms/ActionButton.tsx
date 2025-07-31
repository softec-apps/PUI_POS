'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ActionButtonProps {
	icon?: React.ReactNode
	text?: string | React.ReactNode
	onClick?: () => void
	tooltip?: string
	variant?: 'secondary' | 'destructive' | 'ghost' | 'link' | 'outline' | 'default'
	size?: 'default' | 'icon' | 'lg' | 'sm' | 'xs' | 'pos'
	showTooltip?: boolean
	className?: string
	disabled?: boolean | React.ReactNode
	type?: 'button' | 'submit' | 'reset'
}

export const ActionButton = ({
	icon,
	text,
	onClick,
	tooltip,
	variant = 'default',
	size,
	showTooltip = !!tooltip,
	className = '',
	disabled = false,
	type = 'button',
	...props
}: ActionButtonProps) => {
	const [isHovered, setIsHovered] = useState(false)
	const resolvedSize = size ?? (text ? 'default' : 'icon')

	const buttonContent = (
		<>
			{icon && (
				<motion.span
					animate={{
						scale: isHovered && !disabled ? 1 : 1,
						rotate: isHovered && !disabled ? 0 : 0,
					}}
					transition={{ type: 'spring', stiffness: 200, damping: 10 }}>
					{icon}
				</motion.span>
			)}
			{text && <span className={disabled ? 'opacity-75' : ''}>{text}</span>}
		</>
	)

	const handleClick = (e: React.MouseEvent) => {
		if (disabled) {
			e.preventDefault()
			return
		}
		onClick?.()
	}

	const button = (
		<motion.div
			whileHover={!disabled ? { scale: 1 } : {}}
			whileTap={!disabled ? { scale: 1 } : {}}
			onHoverStart={() => !disabled && setIsHovered(true)}
			onHoverEnd={() => setIsHovered(false)}>
			<Button
				type={type}
				variant={variant}
				size={resolvedSize}
				onClick={handleClick}
				disabled={disabled}
				className={`transition-all duration-200 ${
					disabled ? 'cursor-not-allowed opacity-75' : 'hover:opacity-90 active:opacity-100'
				} ${className}`}
				aria-label={tooltip}
				aria-disabled={disabled}
				{...props}>
				{buttonContent}
			</Button>
		</motion.div>
	)

	return tooltip && showTooltip ? (
		<Tooltip>
			<TooltipTrigger asChild disabled={disabled}>
				{button}
			</TooltipTrigger>
			{!disabled && <TooltipContent side='top'>{tooltip}</TooltipContent>}
		</Tooltip>
	) : (
		button
	)
}
