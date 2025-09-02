'use client'

import { I_User } from '@/common/types/modules/user'
import { ConfirmationModal } from '@/components/layout/templates/ConfirmationModal'

interface RestoreModalProps {
	isOpen: boolean
	currentRecord: I_User | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function RestoreModal({ isOpen, currentRecord, isAction, onClose, onConfirm }: RestoreModalProps) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='success'
			title='Restaurar usuario'
			description='Esta acción se puede deshacer'
			message={
				<>
					¿Deseas restaurar al usuario{' '}
					<span className='text-foreground font-semibold'>
						{currentRecord?.email} ({currentRecord?.firstName} {currentRecord?.lastName})
					</span>
					?
				</>
			}
			alertMessage={
				<>
					<p className='text-emerald-600 dark:text-emerald-400'>El usuario volvera a tener acceso al sistema.</p>
				</>
			}
			isProcessing={isAction}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmText='Restaurar'
			cancelText='Cancelar'
		/>
	)
}
