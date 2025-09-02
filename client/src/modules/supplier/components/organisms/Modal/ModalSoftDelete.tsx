'use client'

import { I_Supplier } from '@/common/types/modules/supplier'
import { ConfirmationModal } from '@/components/layout/templates/ConfirmationModal'

interface SoftDeleteModalProps {
	isOpen: boolean
	currentRecord: I_Supplier | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function SoftDeleteModal({ isOpen, currentRecord, isAction, onClose, onConfirm }: SoftDeleteModalProps) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='warning'
			title='Remover proveedor'
			description='Esta acción se puede deshacer'
			message={
				<>
					¿Deseas remover temporalmente el proveedor{' '}
					<span className='text-foreground font-semibold'>{currentRecord?.legalName}</span>?
				</>
			}
			alertMessage={
				<>
					<p className='text-amber-600 dark:text-amber-400'>
						El proveedor no estara disponible en el sistema de forma temporal.
					</p>
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
