'use client'

import { Brand_I } from '@/modules/atribute/types/attribute'
import { ConfirmationModal } from '@/components/layout/atoms/ConfirmationModal'

interface Props {
	isOpen: boolean
	brand: Brand_I | null
	isSoftDeleting: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function SoftDeleteModal({ isOpen, brand, isSoftDeleting, onClose, onConfirm }: Props) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='warning'
			title='Remover categoría'
			description='Esta acción se puede deshacer'
			message={
				<>
					¿Estás seguro de que deseas remover la categoría{' '}
					<span className='text-foreground font-semibold'>{brand?.name}</span>? Todos los productos asociados a esta
					categoría perderán su clasificación.
				</>
			}
			alertMessage='Esta acción removerá la categoría de la base de datos pero no sera elimiando de forma permanente.'
			isProcessing={isSoftDeleting}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmText='Ok, remover'
			cancelText='No, cancelar'
		/>
	)
}
