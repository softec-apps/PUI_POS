'use client'

import { Check, ChevronsUpDown, GalleryVerticalEnd } from 'lucide-react'
import * as React from 'react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { useEstablishment } from '@/common/hooks/useEstablishment'
import { ImageControl } from './layout/organims/ImageControl'

interface Tenant {
	id: string
	name: string
}

export function OrgSwitcher({
	tenants,
	defaultTenant,
	onTenantSwitch,
}: {
	tenants: Tenant[]
	defaultTenant: Tenant
	onTenantSwitch?: (tenantId: string) => void
}) {
	const [selectedTenant, setSelectedTenant] = React.useState<Tenant | undefined>(
		defaultTenant || (tenants.length > 0 ? tenants[0] : undefined)
	)

	const handleTenantSwitch = (tenant: Tenant) => {
		setSelectedTenant(tenant)
		if (onTenantSwitch) onTenantSwitch(tenant.id)
	}

	const { recordsData, loading, error } = useEstablishment()
	const dataRecord = recordsData?.data.items[0]

	if (!selectedTenant) return null

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size='lg'
							className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
							<div className='flex aspect-square size-8 items-center justify-center'>
								<ImageControl
									recordData={dataRecord}
									enableHover={false}
									enableClick={false}
									imageHeight={35}
									imageWidth={35}
								/>
							</div>
							<div className='flex flex-col gap-0.5 leading-none'>
								<span className='font-semibold'>{dataRecord?.tradeName}</span>
								<span className=''>{selectedTenant.name}</span>
							</div>
							<ChevronsUpDown className='ml-auto' />
						</SidebarMenuButton>
					</DropdownMenuTrigger>

					<DropdownMenuContent className='w-[--radix-dropdown-menu-trigger-width]' align='start'>
						{tenants.map(tenant => (
							<DropdownMenuItem key={tenant.id} onSelect={() => handleTenantSwitch(tenant)}>
								{tenant.name} {tenant.id === selectedTenant.id && <Check className='ml-auto' />}
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
