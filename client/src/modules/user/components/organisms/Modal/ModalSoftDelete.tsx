'use client'

import { I_User } from '@/common/types/modules/user'
import { ConfirmationModal } from '@/components/layout/atoms/ConfirmationModal'

interface SoftDeleteModalProps {
	isOpen: boolean
	currentRecord: I_User | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function SoftDeleteModal({ isOpen, currentRecord, isAction, onClose, onConfirm }: SoftDeleteModalProps) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='warning'
			title='Remover usuario'
			description='Esta acción no se puede deshacer'
			message={
				<>
					¿Deseas remover temporalmente al usuario{' '}
					<span className='text-foreground font-semibold'>
						{currentRecord?.email} ({currentRecord?.firstName} {currentRecord?.lastName})
					</span>
					?
				</>
			}
			alertMessage={
				<>
					<p className='text-destructive'>El usuario perderá acceso al sistema de forma temporal.</p>
				</>
			}
			isProcessing={isAction}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmText='Remover'
			cancelText='Cancelar'
		/>
	)
}
