'use client'

import { useCustomerDetail } from '@/modules/customer/hooks/useCustomerDetail'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
	customerId: string
}

export function CustomerDetailView({ customerId }: Props) {
	const { customer, purchases, sales, quotes, proformas, isLoading } = useCustomerDetail(customerId)

	if (isLoading) {
		return <div>Loading...</div>
	}

	if (!customer) {
		return <div>Customer not found</div>
	}

	return (
		<div className='flex flex-col gap-4'>
			<Card>
				<CardHeader>
					<CardTitle>
						{customer.firstName} {customer.lastName}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<p>Email: {customer.email}</p>
					<p>Phone: {customer.phone}</p>
					<p>Address: {customer.address}</p>
				</CardContent>
			</Card>

			<Tabs defaultValue='purchases'>
				<TabsList>
					<TabsTrigger value='purchases'>Purchases</TabsTrigger>
					<TabsTrigger value='sales'>Sales</TabsTrigger>
					<TabsTrigger value='quotes'>Quotes</TabsTrigger>
					<TabsTrigger value='proformas'>Proformas</TabsTrigger>
				</TabsList>
				<TabsContent value='purchases'>
					<Card>
						<CardHeader>
							<CardTitle>Purchases</CardTitle>
						</CardHeader>
						<CardContent>
							<pre>{JSON.stringify(purchases, null, 2)}</pre>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value='sales'>
					<Card>
						<CardHeader>
							<CardTitle>Sales</CardTitle>
						</CardHeader>
						<CardContent>
							<pre>{JSON.stringify(sales, null, 2)}</pre>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value='quotes'>
					<Card>
						<CardHeader>
							<CardTitle>Quotes</CardTitle>
						</CardHeader>
						<CardContent>
							<pre>{JSON.stringify(quotes, null, 2)}</pre>
						</CardContent>
					</Card>
				</TabsContent>
				<TabsContent value='proformas'>
					<Card>
						<CardHeader>
							<CardTitle>Proformas</CardTitle>
						</CardHeader>
						<CardContent>
							<pre>{JSON.stringify(proformas, null, 2)}</pre>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	)
}
