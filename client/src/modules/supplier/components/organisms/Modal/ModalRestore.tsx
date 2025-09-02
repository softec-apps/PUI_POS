'use client'

import { I_Supplier } from '@/common/types/modules/supplier'
import { ConfirmationModal } from '@/components/layout/templates/ConfirmationModal'

interface RestoreModalProps {
	isOpen: boolean
	currentRecord: I_Supplier | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function RestoreModal({ isOpen, currentRecord, isAction, onClose, onConfirm }: RestoreModalProps) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='success'
			title='Restaurar proveedor'
			description='Esta acción se puede deshacer'
			message={
				<>
					¿Deseas restaurar el proveedor{' '}
					<span className='text-foreground font-semibold'>{currentRecord?.legalName}</span>?
				</>
			}
			alertMessage={
				<>
					<p className='text-emerald-600 dark:text-emerald-400'>
						El proveedor volvera ha estar disponible en el sistema.
					</p>
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
