'use client'

import { I_Customer } from '@/common/types/modules/customer'
import { ConfirmationModal } from '@/components/layout/templates/ConfirmationModal'

interface HardDeleteModalProps {
	isOpen: boolean
	currentRecord: I_Customer | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function HardDeleteModal({ isOpen, currentRecord, isAction, onClose, onConfirm }: HardDeleteModalProps) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='destructive'
			title='Eliminar cliente'
			description='Esta acción no se puede deshacer'
			message={
				<>
					¿Deseas eliminar permanentemente el cliente{' '}
					<span className='text-foreground font-semibold'>
						{currentRecord?.firstName} {currentRecord?.lastName?.charAt(0)} ({currentRecord?.identificationNumber})
					</span>
					?
				</>
			}
			alertMessage={
				<>
					<p className='text-destructive'>Esta cliente será eliminado de forma permanente y no podrá recuperarse.</p>
				</>
			}
			confirmKey={currentRecord?.identificationNumber}
			isProcessing={isAction}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmText='Eliminar'
			cancelText='Cancelar'
		/>
	)
}
