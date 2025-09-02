'use client'

import { I_Category } from '@/common/types/modules/category'
import { ConfirmationModal } from '@/components/layout/templates/ConfirmationModal'

interface RestoreModalProps {
	isOpen: boolean
	currentRecord: I_Category | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function RestoreModal({ isOpen, currentRecord, isAction, onClose, onConfirm }: RestoreModalProps) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='success'
			title='Restaurar categoría'
			description='Esta acción se puede deshacer'
			message={
				<>
					¿Deseas restaurar la categoría <span className='text-foreground font-semibold'>{currentRecord?.name}</span>?
				</>
			}
			alertMessage={
				<>
					<p className='text-emerald-600 dark:text-emerald-400'>La categoría volvera a estar accesible en el sistema</p>
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
