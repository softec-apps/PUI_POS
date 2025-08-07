'use client'

import { Brand_I } from '@/common/types/modules/attribute'
import { ConfirmationModal } from '@/components/layout/atoms/ConfirmationModal'

interface RestoreConfirmationModalProps {
	isOpen: boolean
	brand: Brand_I | null
	isRestoring: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function RestoreModal({ isOpen, brand, isRestoring, onClose, onConfirm }: RestoreConfirmationModalProps) {
	return (
		<ConfirmationModal
			variant='success'
			isOpen={isOpen}
			title='Restaurar marca'
			description='Esta acción se puede deshacer'
			message={
				<>
					¿Estás seguro de que deseas remover la marca{' '}
					<span className='text-foreground font-semibold'>{brand?.name}</span>? Todos los productos asociados a esta
					marca perderán su clasificación.
				</>
			}
			alertMessage='Esta marca volverá a estar activa en el sistema.'
			isProcessing={isRestoring}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmText='Ok, restaurar'
			cancelText='No, cancelar'
		/>
	)
}
