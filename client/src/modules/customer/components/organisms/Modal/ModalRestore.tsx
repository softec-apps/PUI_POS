'use client'

import { Category_I } from '@/common/types/modules/attribute'
import { ConfirmationModal } from '@/components/layout/atoms/ConfirmationModal'

interface RestoreConfirmationModalProps {
	isOpen: boolean
	category: Category_I | null
	isRestoring: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function RestoreModal({ isOpen, category, isRestoring, onClose, onConfirm }: RestoreConfirmationModalProps) {
	return (
		<ConfirmationModal
			variant='success'
			isOpen={isOpen}
			title='Restaurar categoría'
			description='Esta acción se puede deshacer'
			message={
				<>
					¿Estás seguro de que deseas remover la categoría{' '}
					<span className='text-foreground font-semibold'>{category?.name}</span>? Todos los productos asociados a esta
					categoría perderán su clasificación.
				</>
			}
			alertMessage='Esta categoría volverá a estar activa en el sistema.'
			isProcessing={isRestoring}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmText='Ok, restaurar'
			cancelText='No, cancelar'
		/>
	)
}
