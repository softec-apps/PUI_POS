'use client'

import { I_Category } from '@/common/types/modules/category'
import { ConfirmationModal } from '@/components/layout/atoms/ConfirmationModal'

interface Props {
	isOpen: boolean
	category: I_Category | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function HardDeleteModal({ isOpen, category, isAction, onClose, onConfirm }: Props) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='destructive'
			title='Eliminar categoría'
			description='Esta acción no se puede deshacer'
			message={
				<>
					¿Estás seguro de que deseas eliminar de forma permanente la categoría{' '}
					<span className='text-foreground font-semibold'>{category?.name}</span>? Todos los productos asociados a esta
					categoría perderán su clasificación permanentemente.
				</>
			}
			alertMessage='Esta acción eliminará la categoría de la base de datos de forma permanente.'
			isProcessing={isAction}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmText='Ok, eliminar'
			cancelText='No, cancelar'
		/>
	)
}
