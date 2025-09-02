'use client'

import { ActionButton } from '@/components/layout/atoms/ActionButton'

interface ImportButtonProps {
	onClick: () => void
	config: {
		text?: string
		tooltip?: string
		icon: React.ReactNode
		size?: 'xs' | 'sm' | 'lg' | 'pos' | 'icon'
		variant?: 'default' | 'secondary' | 'outline' | 'ghost'
		disabled?: boolean
	}
}

export function ImportButton({ onClick, config }: ImportButtonProps) {
	return (
		<ActionButton
			onClick={onClick}
			size={config.size || 'default'}
			variant={config.variant || 'outline'}
			disabled={config.disabled}
			text={config.text}
			icon={config.icon}
			tooltip={config.tooltip}
		/>
	)
}
