'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { CardHeaderInfo } from '../atoms/CardHeaderInfo'

export function ThemeSelectorCard() {
	const { theme, setTheme, resolvedTheme } = useTheme()
	const [isMounted, setIsMounted] = useState(false)

	useEffect(() => {
		setIsMounted(true)
	}, [])

	const themes = [
		{
			id: 'light',
			name: 'Claro',
			preview: (
				<div className='absolut inset-0 flex flex-col'>
					<div className='flex flex-1 border bg-white'>
						<div className='flex w-1/4 flex-col justify-between space-y-2 border-r border-neutral-100 bg-neutral-100 p-2'>
							<div className='space-y-2'>
								<div className='h-2.5 w-2/8 rounded-full bg-neutral-800' />
								{[...Array(3)].map((_, i) => (
									<div key={i} className='bg-muted-foreground/15 dark:bg-muted-foreground/20 h-2 w-full rounded-full' />
								))}
							</div>

							<div className='mt-auto flex items-center space-x-2'>
								<div className='bg-muted-foreground/15 dark:bg-muted-foreground/20 h-3 w-3 rounded-full' />
								<div className='flex-1'>
									<div className='bg-muted-foreground/15 dark:bg-muted-foreground/20 h-2 w-3/4 rounded-full' />
								</div>
							</div>
						</div>

						<div className='w-3/4 space-y-4 p-3'>
							<div className='bg-muted-foreground/15 dark:bg-muted-foreground/20 mb-3 h-3 w-1/2 rounded-full' />
							<div className='grid grid-cols-3 gap-2'>
								{[...Array(3)].map((_, i) => (
									<div key={i} className='bg-muted-foreground/15 dark:bg-muted-foreground/20 h-6 rounded' />
								))}
							</div>

							<Separator className='bg-muted-foreground/15 dark:bg-muted-foreground/20' />

							<div className='grid grid-cols-1 gap-2'>
								{[...Array(2)].map((_, i) => (
									<div key={i} className='bg-muted-foreground/15 dark:bg-muted-foreground/20 h-6 rounded' />
								))}
							</div>
						</div>
					</div>
				</div>
			),
		},
		{
			id: 'dark',
			name: 'Oscuro',
			preview: (
				<div className='absolut inset-0 flex flex-col'>
					<div className='flex flex-1 border bg-neutral-900'>
						<div className='flex w-1/4 flex-col justify-between space-y-2 border-r border-neutral-700 bg-neutral-800 p-2'>
							<div className='space-y-2'>
								<div className='h-2.5 w-2/8 rounded-full bg-neutral-100' />
								{[...Array(3)].map((_, i) => (
									<div key={i} className='bg-muted-foreground/15 h-2 w-full rounded-full' />
								))}
							</div>

							<div className='mt-auto flex items-center space-x-2'>
								<div className='bg-muted-foreground/15 h-3 w-3 rounded-full' />
								<div className='flex-1'>
									<div className='bg-muted-foreground/15 h-2 w-3/4 rounded-full' />
								</div>
							</div>
						</div>

						<div className='w-3/4 space-y-4 p-3'>
							<div className='bg-muted-foreground/15 mb-3 h-3 w-1/2 rounded-full' />
							<div className='grid grid-cols-3 gap-2'>
								{[...Array(3)].map((_, i) => (
									<div key={i} className='bg-muted-foreground/15 h-6 rounded' />
								))}
							</div>

							<Separator className='bg-muted-foreground/15' />

							<div className='grid grid-cols-1 gap-2'>
								{[...Array(2)].map((_, i) => (
									<div key={i} className='bg-muted-foreground/15 h-6 rounded' />
								))}
							</div>
						</div>
					</div>
				</div>
			),
		},
		{
			id: 'system',
			name: 'Sistema',
			preview:
				resolvedTheme === 'dark' ? (
					<div className='absolut inset-0 flex flex-col'>
						<div className='flex flex-1 border bg-neutral-900'>
							<div className='flex w-1/4 flex-col justify-between space-y-2 border-r border-neutral-700 bg-neutral-800 p-2'>
								<div className='space-y-2'>
									<div className='h-2.5 w-2/8 rounded-full bg-neutral-100' />
									{[...Array(3)].map((_, i) => (
										<div key={i} className='bg-muted-foreground/15 h-2 w-full rounded-full' />
									))}
								</div>

								<div className='mt-auto flex items-center space-x-2'>
									<div className='bg-muted-foreground/15 h-3 w-3 rounded-full' />
									<div className='flex-1'>
										<div className='bg-muted-foreground/15 h-2 w-3/4 rounded-full' />
									</div>
								</div>
							</div>

							<div className='w-3/4 space-y-4 p-3'>
								<div className='bg-muted-foreground/15 mb-3 h-3 w-1/2 rounded-full' />
								<div className='grid grid-cols-3 gap-2'>
									{[...Array(3)].map((_, i) => (
										<div key={i} className='bg-muted-foreground/15 h-6 rounded' />
									))}
								</div>

								<Separator className='bg-muted-foreground/15' />

								<div className='grid grid-cols-1 gap-2'>
									{[...Array(2)].map((_, i) => (
										<div key={i} className='bg-muted-foreground/15 h-6 rounded' />
									))}
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className='absolut inset-0 flex flex-col'>
						<div className='flex flex-1 border bg-white'>
							<div className='flex w-1/4 flex-col justify-between space-y-2 border-r border-neutral-100 bg-neutral-100 p-2'>
								<div className='space-y-2'>
									<div className='h-2.5 w-2/8 rounded-full bg-neutral-800' />
									{[...Array(3)].map((_, i) => (
										<div
											key={i}
											className='bg-muted-foreground/15 dark:bg-muted-foreground/20 h-2 w-full rounded-full'
										/>
									))}
								</div>

								<div className='mt-auto flex items-center space-x-2'>
									<div className='bg-muted-foreground/15 dark:bg-muted-foreground/20 h-3 w-3 rounded-full' />
									<div className='flex-1'>
										<div className='bg-muted-foreground/15 dark:bg-muted-foreground/20 h-2 w-3/4 rounded-full' />
									</div>
								</div>
							</div>

							<div className='w-3/4 space-y-4 p-3'>
								<div className='bg-muted-foreground/15 dark:bg-muted-foreground/20 mb-3 h-3 w-1/2 rounded-full' />
								<div className='grid grid-cols-3 gap-2'>
									{[...Array(3)].map((_, i) => (
										<div key={i} className='bg-muted-foreground/15 dark:bg-muted-foreground/20 h-6 rounded' />
									))}
								</div>

								<Separator className='bg-muted-foreground/15 dark:bg-muted-foreground/20' />

								<div className='grid grid-cols-1 gap-2'>
									{[...Array(2)].map((_, i) => (
										<div key={i} className='bg-muted-foreground/15 dark:bg-muted-foreground/20 h-6 rounded' />
									))}
								</div>
							</div>
						</div>
					</div>
				),
		},
	]

	return (
		<div className='space-y-6'>
			{/* Layout horizontal: textos a la izquierda, cards a la derecha */}
			<div className='flex flex-col gap-6 lg:flex-row'>
				{/* Columna izquierda: Información */}
				<div className='space-y-2 lg:w-1/3'>
					<CardHeaderInfo
						title='Tema'
						description='Selecciona entre los modos claro, oscuro o sistema para personalizar la apariencia de la aplicación.'
					/>
				</div>

				{/* Columna derecha: Cards de temas */}
				<div className='lg:w-2/3'>
					<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
						{!isMounted
							? [...Array(themes.length)].map((_, i) => (
									<Card key={`skeleton-${i}`} className='overflow-hidden'>
										<CardContent>
											<div className='relative h-[165px]'>
												<Skeleton className='h-full w-full rounded-none' />
											</div>
											<div className='pt-7'>
												<Skeleton className='h-5 w-3/12' />
											</div>
										</CardContent>
									</Card>
								))
							: themes.map(t => (
									<button
										key={t.id}
										onClick={() => setTheme(t.id)}
										className={`cursor-pointer rounded-b-xl transition-all duration-300 ${
											theme === t.id ? 'ring-primary ring-2 ring-offset-2' : 'hover:ring-border hover:ring-2'
										}`}>
										<Card className='group-hover:border-border h-full overflow-hidden rounded-t-none border-transparent bg-transparent p-0 shadow-none transition-colors'>
											<CardContent className='p-0'>
												<div className='relative h-[165px]'>{t.preview}</div>
												<div className='flex items-center justify-center p-4'>
													<h3 className='text-center text-sm font-medium'>{t.name}</h3>
												</div>
											</CardContent>
										</Card>
									</button>
								))}
					</div>
				</div>
			</div>
		</div>
	)
}
