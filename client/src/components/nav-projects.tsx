'use client'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from '@/components/ui/sidebar'
import { LucideDotSquare, LucideFolder, LucideShredder, LucideTrash } from 'lucide-react'

export function NavProjects({
	projects,
}: {
	projects: {
		name: string
		url: string
	}[]
}) {
	const { isMobile } = useSidebar()

	return (
		<SidebarGroup className='group-data-[collapsible=icon]:hidden'>
			<SidebarGroupLabel>Projects</SidebarGroupLabel>
			<SidebarMenu>
				{projects.map(item => (
					<SidebarMenuItem key={item.name}>
						<SidebarMenuButton asChild>
							<a href={item.url}>
								<span>{item.name}</span>
							</a>
						</SidebarMenuButton>

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuAction showOnHover>
									<LucideDotSquare />
									<span className='sr-only'>More</span>
								</SidebarMenuAction>
							</DropdownMenuTrigger>

							<DropdownMenuContent
								className='w-48 rounded-lg'
								side={isMobile ? 'bottom' : 'right'}
								align={isMobile ? 'end' : 'start'}>
								<DropdownMenuItem>
									<LucideFolder className='text-muted-foreground mr-2 h-4 w-4' />
									<span>View Project</span>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<LucideShredder className='text-muted-foreground mr-2 h-4 w-4' />
									<span>Share Project</span>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<LucideTrash className='text-muted-foreground mr-2 h-4 w-4' />
									<span>Delete Project</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				))}

				<SidebarMenuItem>
					<SidebarMenuButton className='text-sidebar-foreground/70'>
						<LucideDotSquare className='text-sidebar-foreground/70' />
						<span>More</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		</SidebarGroup>
	)
}
