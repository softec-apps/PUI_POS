'use client'

import { I_Category } from '@/common/types/modules/category'
import { ConfirmationModal } from '@/components/layout/templates/ConfirmationModal'

interface SoftDeleteModalProps {
	isOpen: boolean
	currentRecord: I_Category | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function SoftDeleteModal({ isOpen, currentRecord, isAction, onClose, onConfirm }: SoftDeleteModalProps) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='warning'
			title='Remover categoría'
			description='Esta acción se puede deshacer'
			message={
				<>
					¿Deseas remover temporalmente la categoría{' '}
					<span className='text-foreground font-semibold'>{currentRecord?.name}</span>?
				</>
			}
			alertMessage={
				<>
					<p className='text-amber-600 dark:text-amber-400'>
						El categoría perderá acceso al sistema de forma temporal.
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
