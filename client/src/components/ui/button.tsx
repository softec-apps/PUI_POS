import * as React from 'react'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
	"cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-accent-foreground/80",
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				destructive:
					'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
				outline:
					'border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 border border-dashed',
				secondary: 'bg-secondary text-secondary-foreground/90 hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
				link: 'text-primary underline-offset-4 hover:underline',
				success:
					'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500/30 shadow-lg border-2 border-emerald-600 hover:border-emerald-600 font-bold active:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600',
				info: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500/30 shadow-lg border-2 border-blue-600 hover:border-blue-600 font-bold active:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600',
			},
			size: {
				default: 'h-9 px-4 py-2 has-[>svg]:px-3',
				sm: 'h-8 rounded-2xl gap-1.5 px-3 has-[>svg]:px-2.5',
				lg: 'h-10 rounded-2xl px-6 has-[>svg]:px-4',
				xs: 'h-7 rounded-2xl gap-1 px-2 has-[>svg]:px-1.5',
				icon: 'size-8',
				pos: 'h-16 rounded-2xl px-8 has-[>svg]:px-6',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	}
)

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<'button'> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean
	}) {
	const Comp = asChild ? Slot : 'button'
	return <Comp data-slot='button' className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
