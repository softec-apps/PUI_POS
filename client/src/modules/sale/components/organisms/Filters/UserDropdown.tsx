'use client'

import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { motion } from 'framer-motion'
import { Icons } from '@/components/icons'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { useUserData } from '@/modules/user/hooks/useUserData'
import { useState } from 'react'
import { User } from '@/common/types/auth'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'

interface UserDropdownProps {
	currentUser?: string | null
	onUserChange: (userId: string | null) => void
}

export function UserDropdown({ currentUser, onUserChange }: UserDropdownProps) {
	const [searchTerm, setSearchTerm] = useState('')

	const {
		data: userData,
		loading,
		error,
	} = useUserData({
		limit: 10,
		search: searchTerm,
	})

	const getCurrentUserLabel = () => {
		if (!currentUser) return 'Todos los usuarios'
		const selectedUser = userData.items.find((user: User) => user.id === currentUser)
		return selectedUser?.firstName || 'Usuario seleccionado'
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<ActionButton
					icon={loading ? <Icons.refresh className='animate-spin' /> : <Icons.userGroup />}
					text={getCurrentUserLabel()}
					variant='ghost'
					disabled={loading}
				/>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='max-h-80 min-w-xs overflow-y-auto'>
				<DropdownMenuLabel className='text-muted-foreground flex items-center gap-2 text-xs tracking-wide uppercase'>
					<Icons.userGroup className='h-3 w-3' />
					Filtrar por usuario
				</DropdownMenuLabel>
				<DropdownMenuSeparator />

				{/* Search input for users */}
				<div className='px-2 py-1'>
					<div className='relative'>
						<Icons.search className='text-muted-foreground absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2' />
						<input
							type='text'
							placeholder='Buscar usuario...'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className='border-border bg-background focus:ring-primary w-full rounded-md border py-1 pr-2 pl-7 text-sm focus:ring-1 focus:outline-none'
						/>
					</div>
				</div>

				{/* Show all users option */}
				<DropdownMenuItem
					onClick={() => onUserChange(null)}
					className='hover:bg-accent/80 text-accent-foreground/75 cursor-pointer rounded-lg transition-all duration-200'>
					<motion.div
						className='flex w-full items-center justify-between'
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}>
						<span className={!currentUser ? 'text-primary font-medium' : ''}>Todos los usuarios</span>
						{!currentUser && (
							<motion.div
								className='bg-primary h-2 w-2 rounded-full'
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ type: 'spring', stiffness: 500 }}
							/>
						)}
					</motion.div>
				</DropdownMenuItem>

				{/* Error state */}
				{error && (
					<DropdownMenuItem disabled className='text-destructive text-xs'>
						<Icons.alertCircle className='mr-2 h-3 w-3' />
						Error al cargar usuarios
					</DropdownMenuItem>
				)}

				{/* Loading state */}
				{loading && (
					<DropdownMenuItem disabled className='text-muted-foreground text-xs'>
						<SpinnerLoader inline text='Cargando usuarios...' />
					</DropdownMenuItem>
				)}

				{/* Users list */}
				{!loading &&
					!error &&
					userData.items.map((user: User, index: number) => (
						<DropdownMenuItem
							key={user.id}
							onClick={() => onUserChange(user.id)}
							className='hover:bg-accent/80 text-accent-foreground/75 cursor-pointer rounded-lg transition-all duration-200'>
							<motion.div
								className='flex w-full items-center justify-between'
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: (index + 1) * 0.03 }}>
								<div className='flex min-w-0 flex-1 items-center gap-2'>
									<div className='min-w-0 flex-1'>
										<span
											className={`block truncate ${currentUser === user.id ? 'text-primary font-medium' : ''}`}
											title={user.firstName}>
											{user.firstName} {user.lastName}
										</span>
										{user.email && (
											<span className='text-muted-foreground block truncate text-xs' title={user.email}>
												{user.email}
											</span>
										)}
									</div>
								</div>
								{currentUser === user.id && (
									<motion.div
										className='bg-primary h-2 w-2 flex-shrink-0 rounded-full'
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										transition={{ type: 'spring', stiffness: 500 }}
									/>
								)}
							</motion.div>
						</DropdownMenuItem>
					))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
