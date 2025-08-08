'use client'

import { I_User } from '@/modules/user/types/user'
import { ConfirmationModal } from '@/components/layout/atoms/ConfirmationModal'

interface Props {
	isOpen: boolean
	currentRecord: I_User | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function HardDeleteModal({ isOpen, currentRecord, isAction, onClose, onConfirm }: Props) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='destructive'
			title='Eliminar usuario'
			description='Esta acción es irreversible.'
			message={
				<>
					¿Confirma que desea eliminar permanentemente el usuario{' '}
					<span className='text-foreground font-semibold'>
						{currentRecord?.email} ({currentRecord?.firstName} {currentRecord?.lastName})
					</span>
					?
				</>
			}
			alertMessage='Esta acción eliminará el usuario del sistema de forma permanente, lo que afectará todas las relaciones asociadas.'
			isProcessing={isAction}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmText='Ok, eliminar'
			cancelText='No, cancelar'
		/>
	)
}
