'use client'

import { ReactNode } from 'react'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

interface CreateButtonProps {
	onClick: () => void

	// Configuración del botón
	config?: {
		text?: string
		icon?: ReactNode
		disabled?: boolean
		size?: 'xs' | 'sm' | 'lg' | 'pos'
		variant?: 'default' | 'ghost' | 'secondary' | 'outline'
	}
}

export function CreateButton({
	onClick,
	config = {
		text: 'Crear nuevo',
		size: 'lg',
		variant: 'default',
	},
}: CreateButtonProps) {
	return (
		<ActionButton
			size={config.size}
			variant={config.variant}
			icon={config.icon}
			text={config.text}
			onClick={onClick}
			disabled={config.disabled}
		/>
	)
}
