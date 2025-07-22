'use client'

import { BellIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Icons } from './icons'

interface Notification {
	id: string
	title: string
	message: string
	read: boolean
	createdAt: Date
}

export function Notifications() {
	const { data: session } = useSession()
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [unreadCount, setUnreadCount] = useState(0)

	useEffect(() => {
		// Simulación: cargar notificaciones
		const fetchNotifications = async () => {
			// En una app real, harías una petición a tu API
			const mockNotifications: Notification[] = [
				{
					id: '1',
					title: 'Nuevo mensaje',
					message: 'Tienes un nuevo mensaje de soporte',
					read: false,
					createdAt: new Date(),
				},
				{
					id: '2',
					title: 'Actualización del sistema',
					message: 'Nueva versión disponible',
					read: false,
					createdAt: new Date(Date.now() - 3600000),
				},
			]
			setNotifications(mockNotifications)
			setUnreadCount(mockNotifications.filter(n => !n.read).length)
		}

		if (session) {
			fetchNotifications()
		}
	}, [session])

	const markAsRead = (id: string) => {
		setNotifications(notifications.map(n => (n.id === id ? { ...n, read: true } : n)))
		setUnreadCount(unreadCount - 1)
	}

	const markAllAsRead = () => {
		setNotifications(notifications.map(n => ({ ...n, read: true })))
		setUnreadCount(0)
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant='secondary' size='icon' className='relative'>
					{unreadCount > 0 ? <Icons.bellRinging /> : <Icons.bell />}
					{unreadCount > 0 && (
						<Badge
							variant='destructive'
							className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full p-0'>
							{unreadCount}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent className='w-80 p-0' align='end'>
				<div className='flex items-center justify-between border-b px-4 py-2'>
					<h3 className='font-semibold'> Notificaciones </h3>
				</div>

				<ScrollArea className='h-72'>
					{notifications.length === 0 ? (
						<div className='text-muted-foreground p-4 text-center text-sm'>No hay notificaciones</div>
					) : (
						<div className='divide-y'>
							{notifications.map(notification => (
								<div
									key={notification.id}
									className={`hover:bg-accent cursor-pointer p-3 ${!notification.read ? 'bg-accent/50' : ''}`}
									onClick={() => markAsRead(notification.id)}>
									<div className='flex justify-between'>
										<h4 className='font-medium'>{notification.title}</h4>
										<time className='text-muted-foreground text-xs'>
											{new Date(notification.createdAt).toLocaleTimeString()}
										</time>
									</div>
									<p className='text-muted-foreground text-sm'>{notification.message}</p>
								</div>
							))}
						</div>
					)}
				</ScrollArea>
			</PopoverContent>
		</Popover>
	)
}
