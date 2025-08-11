'use client'

import React from 'react'
import { Icons } from '@/components/icons'
import { UtilBanner } from '@/components/UtilBanner'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

interface Props {
	title: string
	description: string
	icon: React.ReactNode
}

function ErrorStateCard({ title, description, icon }: Props) {
	return <UtilBanner icon={icon} title={title} description={description} />
}

interface RetryErrorStateProps {
	onRetry: () => void
}

export function RetryErrorState({ onRetry }: RetryErrorStateProps) {
	return (
		<div className='flex flex-col items-center justify-center gap-8'>
			<ErrorStateCard
				icon={<Icons.alertTriangle className='h-10 w-10' />}
				title='¡Oops! Ha ocurrido un error'
				description={`Por favor usa las siguientes opciones. ¿Lo intentamos de nuevo...?`}
			/>

			<div className='flex items-center justify-center gap-4'>
				<ActionButton size='lg' variant='ghost' text='Recargar página' onClick={() => window.location.reload()} />
				<ActionButton
					size='lg'
					text='Intentar de nuevo'
					onClick={onRetry}
					icon={<Icons.refresh className='h-4 w-4' />}
				/>
			</div>
		</div>
	)
}

interface FatalErrorStateProps {
	showReloadButton?: boolean
}

export function FatalErrorState({ showReloadButton = true }: FatalErrorStateProps) {
	return (
		<div className='flex flex-col items-center justify-center gap-8'>
			<ErrorStateCard
				icon={<Icons.serverOff className='h-10 w-10' />}
				title='¡Vaya! Algo no ha ido bien'
				description='No eres tú, soy yo. Dame un poco de tiempo para solucionarlo.'
			/>

			{showReloadButton && (
				<ActionButton
					size='lg'
					text='Recargar página'
					icon={<Icons.refresh className='h-4 w-4' />}
					onClick={() => window.location.reload()}
				/>
			)}
		</div>
	)
}
