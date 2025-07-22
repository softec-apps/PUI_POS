'use client'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarRail,
} from '@/components/ui/sidebar'
import { useMediaQuery } from '@/common/hooks/use-media-query'
import { useRoleBasedNavigation } from '@/common/hooks/useRoleBasedNavigation'
import {
	IconBell,
	IconChevronRight,
	IconChevronsDown,
	IconCreditCard,
	IconLogout,
	IconPhotoUp,
	IconUserCircle,
} from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import * as React from 'react'
import { Icons } from '@/components/icons'
import { LogoutButton } from '@/components/logout-button'
import { OrgSwitcher } from '@/components/org-switcher'
import { UserAvatarProfile } from '../user-avatar-profile'
import { useSession } from 'next-auth/react'
import { getRoleDisplayName } from '@/common/utils/role-utils'
import { Skeleton } from '../ui/skeleton'

export const company = {
	name: 'Acme Inc',
	logo: IconPhotoUp,
	plan: 'Enterprise',
}

const tenants = [
	{ id: '1', name: 'Acme Inc' },
	{ id: '2', name: 'Beta Corp' },
	{ id: '3', name: 'Gamma Ltd' },
]

export default function AppSidebar() {
	const pathname = usePathname()
	const { isOpen } = useMediaQuery()
	const router = useRouter()
	const { data: userSession } = useSession()

	// Usar el hook personalizado para obtener navegación basada en roles
	const { navItems, userRole, isLoading } = useRoleBasedNavigation()

	const handleSwitchTenant = (_tenantId: string) => {
		// Tenant switching functionality would be implemented here
	}

	const activeTenant = tenants[0]

	React.useEffect(() => {
		// Side effects based on sidebar state changes
	}, [isOpen])

	if (isLoading) {
		return (
			<Sidebar collapsible='icon' variant='inset'>
				<SidebarHeader>
					<Skeleton className='h-10 w-full' />
				</SidebarHeader>

				<SidebarContent>
					<div className='space-y-4 p-2'>
						{Array.from({ length: 10 }).map((_, i) => (
							<Skeleton key={i} className='h-6 w-full' />
						))}
					</div>
				</SidebarContent>
			</Sidebar>
		)
	}

	return (
		<Sidebar collapsible='icon' variant='inset'>
			<SidebarHeader>
				<OrgSwitcher tenants={tenants} defaultTenant={activeTenant} onTenantSwitch={handleSwitchTenant} />
			</SidebarHeader>

			<SidebarContent className='overflow-x-hidden'>
				<SidebarGroup>
					<SidebarMenu className='text-accent-foreground/60 font-medium'>
						{navItems.map(item => {
							const Icon = item.icon ? Icons[item.icon] : Icons.logo
							return item?.items && item?.items?.length > 0 ? (
								<Collapsible key={item.title} asChild defaultOpen={item.isActive} className='group/collapsible'>
									<SidebarMenuItem className='text-accent-foreground/60'>
										<CollapsibleTrigger asChild>
											<SidebarMenuButton tooltip={item.title} isActive={pathname === item.url}>
												{item.icon && <Icon />}
												<span>{item.title}</span>
												<IconChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
											</SidebarMenuButton>
										</CollapsibleTrigger>

										<CollapsibleContent>
											<SidebarMenuSub>
												{item.items?.map(subItem => (
													<SidebarMenuSubItem key={subItem.title}>
														<SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
															<Link href={subItem.url}>
																<span className='text-accent-foreground/60'>{subItem.title}</span>
															</Link>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												))}
											</SidebarMenuSub>
										</CollapsibleContent>
									</SidebarMenuItem>
								</Collapsible>
							) : (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild tooltip={item.title} isActive={pathname === item.url}>
										<Link href={item.url}>
											<Icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							)
						})}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size='lg'
									className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
									<UserAvatarProfile showInfo={false} />
									<IconChevronsDown className='ml-auto size-4' />
								</SidebarMenuButton>
							</DropdownMenuTrigger>

							<DropdownMenuContent
								className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
								side='bottom'
								align='end'
								sideOffset={4}>
								<DropdownMenuLabel className='p-0 font-normal'>
									<div className='flex flex-col space-y-1 px-1 py-1.5'>
										<div className='font-medium'>{userSession?.user?.name || 'Usuario'}</div>
										<div className='text-muted-foreground text-xs'>{userRole && getRoleDisplayName(userRole)}</div>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />

								<DropdownMenuGroup>
									<DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
										<IconUserCircle className='mr-2 h-4 w-4' />
										Profile
									</DropdownMenuItem>
									<DropdownMenuItem>
										<IconCreditCard className='mr-2 h-4 w-4' />
										Billing
									</DropdownMenuItem>
									<DropdownMenuItem>
										<IconBell className='mr-2 h-4 w-4' />
										Notifications
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<IconLogout className='mr-2 h-4 w-4' />
									<LogoutButton />
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
