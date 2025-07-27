'use client'

import React from 'react'
import { Icons } from '@/components/icons'
import { Card } from '@/components/ui/card'
import { UtilBanner } from '@/components/UtilBanner'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

interface Props {
	title: string
	description: string
	icon: React.ReactNode
	actions: React.ReactNode
}

function ErrorStateCard({ title, description, icon }: Props) {
	return (
		<Card className='flex h-screen w-full flex-col items-center justify-center gap-4 border-none bg-transparent shadow-none'>
			<UtilBanner icon={icon} title={title} description={description} />
		</Card>
	)
}

interface RetryErrorStateProps {
	onRetry: () => void
}

export function RetryErrorState({ onRetry }: RetryErrorStateProps) {
	return (
		<ErrorStateCard
			icon={<Icons.alertTriangle className='h-10 w-10' />}
			title='¡Oops! Ha ocurrido un error'
			description={`Por favor usa las siguientes opciones. ¿Lo intentamos de nuevo...?`}
			actions={
				<>
					<ActionButton size='lg' variant='ghost' text='Recargar página' onClick={() => window.location.reload()} />
					<ActionButton
						size='lg'
						text='Intentar de nuevo'
						onClick={onRetry}
						icon={<Icons.refresh className='h-4 w-4' />}
					/>
				</>
			}
		/>
	)
}

export function FatalErrorState() {
	return (
		<ErrorStateCard
			icon={<Icons.serverOff className='h-10 w-10' />}
			title='¡Vaya! Algo no ha ido bien'
			description='No eres tú, soy yo. Dame un poco de tiempo para solucionarlo.'
			actions={
				<ActionButton
					size='lg'
					text='Recargar página'
					icon={<Icons.refresh className='h-4 w-4' />}
					onClick={() => window.location.reload()}
				/>
			}
		/>
	)
}
