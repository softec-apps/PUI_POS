'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = 'system' } = useTheme()

	return (
		<Sonner
			theme={theme as ToasterProps['theme']}
			className='toaster group'
			toastOptions={{
				classNames: {
					toast: 'group-[.toaster]:!bg-card group-[.toaster]:!border-border/50',
					description: 'group-[.toaster]:text-muted-foreground',
					actionButton: 'group-[.toaster]:bg-primary group-[.toaster]:text-primary-foreground',
					cancelButton: 'group-[.toaster]:bg-muted group-[.toaster]:text-muted-foreground',
					success: 'group-[.toaster]:!bg-card group-[.toaster]:!border-border/50',
					error: 'group-[.toaster]:!bg-card group-[.toaster]:!border-border/50',
					warning: 'group-[.toaster]:!bg-card group-[.toaster]:!border-border/50',
					info: 'group-[.toaster]:!bg-card group-[.toaster]:!border-border/50',
				},
			}}
			{...props}
		/>
	)
}

export { Toaster }
