'use client'

import * as React from 'react'
import { LogoType } from '@/components/logos/LogoType'
import { useEstablishment } from '@/common/hooks/useEstablishment'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'

export function OrgSwitcher() {
	const { recordsData, loading, error } = useEstablishment()
	const dataRecord = recordsData?.data.items[0]

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild className='!bg-transparent hover:!bg-transparent'>
						<SidebarMenuButton
							size='lg'
							className='hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0'>
							<LogoType subtitle={dataRecord?.companyName} />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
