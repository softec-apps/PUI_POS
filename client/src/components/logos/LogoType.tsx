'use client'

import Link from 'next/link'
import { Icons } from '@/components/icons'
import { ROUTE_PATH } from '@/common/constants/routes-const'
import { SITE_CONFIG } from '@/common/constants/siteConf-const'

interface LogoTextProps {
	title?: string
	subtitle?: string
}

/**
 * Logo con icono + texto (original)
 */
export const LogoType = ({ title = SITE_CONFIG.NAME, subtitle = 'Sistema Punto de Venta' }: LogoTextProps) => {
	return (
		<Link href={ROUTE_PATH.HOME} className='group flex items-center gap-3'>
			<LogoMark />

			<div className='flex flex-col'>
				<span className='text-primary text-xl font-bold tracking-tight'>{title}</span>
				<span className='text-muted-foreground line-clamp-1 text-xs font-medium break-words'>{subtitle}</span>
			</div>
		</Link>
	)
}

/**
 * Solo el texto del logo
 */
export const LogoText = ({ title = SITE_CONFIG.NAME, subtitle = 'Sistema Punto de Venta' }: LogoTextProps) => {
	return (
		<Link href={ROUTE_PATH.HOME} className='group flex flex-col'>
			<span className='text-primary text-xl font-bold tracking-tight'>{title}</span>
			<span className='text-muted-foreground text-xs font-medium'>{subtitle}</span>
		</Link>
	)
}

/**
 * Solo el ícono del logo
 */
export const LogoMark = () => {
	return (
		<div className='bg-accent flex h-11 w-12 items-center justify-center rounded-xl'>
			<div className='relative'>
				<Icons.brandPatreon className='text-destructive text-2xl' />
				<Icons.brandPatreonFilled className='text-primary absolute -right-0.5 -bottom-0.5 h-3 w-3' />
			</div>
		</div>
	)
}
