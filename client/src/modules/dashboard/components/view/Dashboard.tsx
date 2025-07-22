import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'
import { Skeleton } from '@/components/ui/skeleton'

export async function DashboardView() {
	return (
		<div className='flex flex-1 flex-col gap-6'>
			<div className='flex items-center justify-between space-y-2'>
				<h2 className='text-2xl font-bold tracking-tight'>Hi, Welcome back 👋</h2>
			</div>

			<div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
				<Card className='@container/card'>
					<CardHeader>
						<CardDescription>Total Revenue</CardDescription>
						<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>$1,250.00</CardTitle>
						<CardAction>
							<Badge variant='outline'>
								<IconTrendingUp />
								+12.5%
							</Badge>
						</CardAction>
					</CardHeader>

					<CardFooter className='flex-col items-start gap-1.5 text-sm'>
						<div className='line-clamp-1 flex gap-2 font-medium'>
							Trending up this month <IconTrendingUp className='size-4' />
						</div>
						<div className='text-muted-foreground'>Visitors for the last 6 months</div>
					</CardFooter>
				</Card>

				<Card className='@container/card'>
					<CardHeader>
						<CardDescription>New Customers</CardDescription>
						<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>1,234</CardTitle>
						<CardAction>
							<Badge variant='outline'>
								<IconTrendingDown />
								-20%
							</Badge>
						</CardAction>
					</CardHeader>

					<CardFooter className='flex-col items-start gap-1.5 text-sm'>
						<div className='line-clamp-1 flex gap-2 font-medium'>
							Down 20% this period <IconTrendingDown className='size-4' />
						</div>
						<div className='text-muted-foreground'>Acquisition needs attention</div>
					</CardFooter>
				</Card>

				<Card className='@container/card'>
					<CardHeader>
						<CardDescription>Active Accounts</CardDescription>
						<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>45,678</CardTitle>
						<CardAction>
							<Badge variant='outline'>
								<IconTrendingUp />
								+12.5%
							</Badge>
						</CardAction>
					</CardHeader>

					<CardFooter className='flex-col items-start gap-1.5 text-sm'>
						<div className='line-clamp-1 flex gap-2 font-medium'>
							Strong user retention <IconTrendingUp className='size-4' />
						</div>
						<div className='text-muted-foreground'>Engagement exceed targets</div>
					</CardFooter>
				</Card>

				<Card className='@container/card'>
					<CardHeader>
						<CardDescription>Growth Rate</CardDescription>
						<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>4.5%</CardTitle>
						<CardAction>
							<Badge variant='outline'>
								<IconTrendingUp />
								+4.5%
							</Badge>
						</CardAction>
					</CardHeader>

					<CardFooter className='flex-col items-start gap-1.5 text-sm'>
						<div className='line-clamp-1 flex gap-2 font-medium'>
							Steady performance increase <IconTrendingUp className='size-4' />
						</div>
						<div className='text-muted-foreground'>Meets growth projections</div>
					</CardFooter>
				</Card>
			</div>

			<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
				<div className='col-span-4'>
					<Skeleton className='bg-muted h-48' />
				</div>
				<div className='col-span-4 md:col-span-3'>
					<Skeleton className='bg-muted h-48' />
				</div>
				<div className='col-span-7 md:col-span-7'>
					<Skeleton className='bg-muted h-48' />
				</div>
				<div className='col-span-7 md:col-span-7'>
					<Skeleton className='bg-muted h-48' />
				</div>
			</div>
		</div>
	)
}
