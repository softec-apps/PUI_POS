'use client'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

export function CardMockupTheme({
	theme,
	isActive,
	onClick,
}: {
	theme: { name: string; value: string; colors: Record<string, string>; isScaled: boolean }
	isActive: boolean
	onClick: () => void
}) {
	return (
		<button
			onClick={onClick}
			aria-pressed={isActive}
			className={cn(
				'cursor-pointer rounded-b-xl transition-all duration-300',
				isActive ? 'ring-primary ring-2' : 'hover:ring-border hover:ring-2'
			)}>
			<Card className='group-hover:border-border h-full overflow-hidden rounded-t-none border-transparent bg-transparent p-0 shadow-none transition-colors'>
				<CardContent className='p-0'>
					<div className='relative h-32 overflow-hidden'>
						<div className={cn('grid h-full grid-cols-3 grid-rows-2', theme.colors.background)}>
							<div className={cn('col-span-2 row-span-2', theme.colors.primary)} />
							<div className={cn('', theme.colors.secondary)} />
						</div>
						{isActive && <div className='bg-primary/5 absolute inset-0' />}
					</div>
					<div className='flex items-center justify-center p-4'>
						<h3 className='text-sm font-medium'>{theme.name}</h3>
					</div>
				</CardContent>
			</Card>
		</button>
	)
}
