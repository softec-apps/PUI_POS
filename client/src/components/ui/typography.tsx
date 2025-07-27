'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const typographyVariants = cva('', {
	variants: {
		variant: {
			h1: 'scroll-m-20 text-2xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-accent-foreground/80 dark:text-accent-foreground/90',
			h2: 'scroll-m-20 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-accent-foreground/80 dark:text-accent-foreground/90',
			h3: 'scroll-m-20 text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-accent-foreground/80 dark:text-accent-foreground/90',
			h4: 'scroll-m-20 text-xl sm:text-2xl lg:text-3xl font-medium tracking-tight text-accent-foreground/80 dark:text-accent-foreground/90',
			h5: 'scroll-m-20 text-lg sm:text-xl lg:text-2xl tracking-tight text-accent-foreground/80 dark:text-accent-foreground/90',
			h6: 'scroll-m-20 text-base sm:text-lg lg:text-xl tracking-tight text-accent-foreground/80 dark:text-accent-foreground/90',
			p: 'leading-relaxed text-base sm:text-lg text-muted-foreground mb-4 max-w-prose',
			span: 'inline text-sm sm:text-base text-muted-foreground/90 dark:text-muted-foreground/85',
			small: 'text-sm font-medium leading-none text-muted-foreground/95',
			muted: 'text-sm text-muted-foreground/70',
			lead: 'text-xl sm:text-2xl text-muted-foreground font-light leading-relaxed max-w-prose',
			subtitle: 'text-lg sm:text-xl text-muted-foreground/80 font-medium leading-relaxed',
			caption: 'text-xs sm:text-sm text-muted-foreground/60 uppercase tracking-wider font-medium',
			blockquote: 'border-l-4 border-primary/30 pl-6 italic text-muted-foreground bg-muted/30 py-4 rounded-r-lg my-4',
			code: 'relative rounded-md bg-muted px-2 py-1 font-mono text-sm text-muted-foreground border border-border/50 shadow-sm',
			strong: 'font-semibold text-foreground',
			link: 'text-primary underline-offset-4 hover:underline focus:underline focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm transition-colors',
			error: 'text-red-600 dark:text-red-400 font-medium',
			success: 'text-green-600 dark:text-green-400 font-medium',
			warning: 'text-amber-600 dark:text-amber-400 font-medium',
			display: 'text-6xl sm:text-7xl lg:text-8xl font-bold tracking-tighter text-foreground leading-none',
			overline: 'text-xs uppercase tracking-widest font-semibold text-muted-foreground/80',
		},
	},
	defaultVariants: {
		variant: 'p',
	},
})

// Función para detectar si hay conflictos de clases
const hasConflictingClasses = (className: string) => {
	const conflicts = {
		textSize: /text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/,
		textColor: /text-\w+/,
		fontWeight: /font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/,
		tracking: /tracking-(tighter|tight|normal|wide|wider|widest)/,
		leading: /leading-\w+/,
		margin: /m[xy]?-\w+/,
		padding: /p[xy]?-\w+/,
	}

	return {
		hasTextSize: conflicts.textSize.test(className),
		hasTextColor: conflicts.textColor.test(className),
		hasFontWeight: conflicts.fontWeight.test(className),
		hasTracking: conflicts.tracking.test(className),
		hasLeading: conflicts.leading.test(className),
		hasMargin: conflicts.margin.test(className),
		hasPadding: conflicts.padding.test(className),
	}
}

// Función para limpiar clases conflictivas de las variantes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cleanVariantClasses = (variantClasses: string, conflicts: any) => {
	let cleaned = variantClasses

	if (conflicts.hasTextSize) cleaned = cleaned.replace(/text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)/g, '')

	if (conflicts.hasTextColor) cleaned = cleaned.replace(/text-\w+/g, '')

	if (conflicts.hasFontWeight)
		cleaned = cleaned.replace(/font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)/g, '')

	if (conflicts.hasTracking) cleaned = cleaned.replace(/tracking-(tighter|tight|normal|wide|wider|widest)/g, '')

	if (conflicts.hasLeading) cleaned = cleaned.replace(/leading-\w+/g, '')

	if (conflicts.hasMargin) cleaned = cleaned.replace(/m[xy]?-\w+/g, '')

	if (conflicts.hasPadding) cleaned = cleaned.replace(/p[xy]?-\w+/g, '')

	// Limpiar espacios extra
	return cleaned.replace(/\s+/g, ' ').trim()
}

export interface TypographyProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof typographyVariants> {
	as?: React.ElementType
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
	({ className, variant, as: Component = 'p', ...props }, ref) => {
		// Si no hay className, usar las clases de la variante tal como están
		if (!className) return <Component ref={ref} className={typographyVariants({ variant })} {...props} />

		// Detectar conflictos entre className y variante
		const conflicts = hasConflictingClasses(className)

		// Obtener las clases de la variante
		const variantClasses = typographyVariants({ variant })

		// Limpiar las clases conflictivas de la variante
		const cleanedVariantClasses = cleanVariantClasses(variantClasses, conflicts)

		return <Component ref={ref} className={cn(cleanedVariantClasses, className)} {...props} />
	}
)

Typography.displayName = 'Typography'

export { Typography, typographyVariants }
