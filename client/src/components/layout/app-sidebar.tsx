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
	SidebarGroupLabel,
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
import { useSession } from 'next-auth/react'
import { getRoleDisplayName } from '@/common/utils/role-utils'
import { Skeleton } from '../ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { ChevronsUpDown } from 'lucide-react'
import { ScrollArea } from '../ui/scroll-area'

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

// Componente de skeleton mejorado para los items del menú
const NavigationSkeleton = () => (
	<SidebarGroup>
		<SidebarGroupLabel>
			<Skeleton className='h-4 w-20' />
		</SidebarGroupLabel>
		<SidebarMenu>
			{Array.from({ length: 5 }).map((_, i) => (
				<SidebarMenuItem key={i}>
					<div className='flex items-center space-x-3 p-2'>
						<Skeleton className='h-4 w-4 rounded' />
						<Skeleton className='h-4 flex-1' />
					</div>
				</SidebarMenuItem>
			))}
		</SidebarMenu>
	</SidebarGroup>
)

export default function AppSidebar() {
	const pathname = usePathname()
	const { isOpen } = useMediaQuery()
	const router = useRouter()
	const { data: userSession } = useSession()

	// Usar el hook personalizado para obtener navegación basada en roles
	const { navItems, isLoading, userRole } = useRoleBasedNavigation()

	const handleSwitchTenant = (_tenantId: string) => {
		// Tenant switching functionality would be implemented here
	}

	const activeTenant = tenants[0]

	React.useEffect(() => {
		// Side effects based on sidebar state changes
	}, [isOpen])

	// Determinar si debemos mostrar el skeleton
	// Solo mostramos skeleton si está cargando O si no hay items y no ha terminado de cargar
	const shouldShowSkeleton = isLoading || (navItems.length === 0 && isLoading !== false)

	return (
		<Sidebar collapsible='icon' variant='inset'>
			<SidebarHeader>
				{shouldShowSkeleton ? (
					<div className='p-2'>
						<Skeleton className='h-10 w-full rounded-md' />
					</div>
				) : (
					<OrgSwitcher tenants={tenants} defaultTenant={activeTenant} onTenantSwitch={handleSwitchTenant} />
				)}
			</SidebarHeader>

			<SidebarContent>
				<ScrollArea className='h-screen overflow-auto'>
					{shouldShowSkeleton ? (
						<div className='space-y-6'>
							<NavigationSkeleton />
							<NavigationSkeleton />
						</div>
					) : navItems.length > 0 ? (
						navItems.map(group => (
							<React.Fragment key={group.groupName}>
								<SidebarGroup>
									<SidebarGroupLabel>{group.groupName}</SidebarGroupLabel>
									<SidebarMenu className='text-accent-foreground/60 font-medium'>
										{group.items?.map(item => {
											const Icon = item.icon ? Icons[item.icon] : Icons.logo
											const hasSubItems = item.items && item.items.length > 0

											return hasSubItems ? (
												<Collapsible
													key={item.title}
													asChild
													defaultOpen={item.isActive || item.items?.some(subItem => pathname === subItem.url)}
													className='group/collapsible'>
													<SidebarMenuItem className='text-accent-foreground/60'>
														<CollapsibleTrigger asChild>
															<SidebarMenuButton
																tooltip={item.title}
																isActive={
																	pathname === item.url || item.items?.some(subItem => pathname === subItem.url)
																}>
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
																			<Link href={subItem.url || '#'}>
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
														<Link href={item.url || '#'}>
															<Icon />
															<span>{item.title}</span>
														</Link>
													</SidebarMenuButton>
												</SidebarMenuItem>
											)
										})}
									</SidebarMenu>
								</SidebarGroup>
							</React.Fragment>
						))
					) : (
						// Solo mostrar "Sin acceso" cuando definitivamente no hay items y no está cargando
						!isLoading && (
							<SidebarGroup className='flex h-screen items-center justify-center'>
								<SidebarGroupLabel>Sin acceso</SidebarGroupLabel>
							</SidebarGroup>
						)
					)}
				</ScrollArea>
			</SidebarContent>

			<SidebarFooter>
				{shouldShowSkeleton ? (
					<Skeleton className='h-9 w-full rounded-md' />
				) : (
					<SidebarMenu>
						<SidebarMenuItem>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<SidebarMenuButton
										size='lg'
										className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
										<Avatar className='h-8 w-8 rounded-lg'>
											<AvatarImage src={userSession?.user?.image} alt={userSession?.user?.name} />
											<AvatarFallback className='rounded-lg'>CN</AvatarFallback>
										</Avatar>
										<div className='grid flex-1 text-left text-sm leading-tight'>
											<span className='truncate font-medium'>{userSession?.user?.name}</span>
											<span className='truncate text-xs'>{userSession?.user?.email}</span>
										</div>
										<ChevronsUpDown className='ml-auto size-4' />
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
				)}
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	)
}
