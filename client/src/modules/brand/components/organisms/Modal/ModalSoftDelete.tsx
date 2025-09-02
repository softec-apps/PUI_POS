'use client'

import { I_Brand } from '@/common/types/modules/brand'
import { ConfirmationModal } from '@/components/layout/templates/ConfirmationModal'

interface SoftDeleteModalProps {
	isOpen: boolean
	currentRecord: I_Brand | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function SoftDeleteModal({ isOpen, currentRecord, isAction, onClose, onConfirm }: SoftDeleteModalProps) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='warning'
			title='Remover marca'
			description='Esta acción se puede deshacer'
			message={
				<>
					¿Deseas remover temporalmente la marca{' '}
					<span className='text-foreground font-semibold'>{currentRecord?.name}</span>?
				</>
			}
			alertMessage={
				<>
					<p className='text-amber-600 dark:text-amber-400'>
						La marca no estara disponible en el sistema de forma temporal.
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
