'use client'

import { I_Brand } from '@/common/types/modules/brand'
import { ConfirmationModal } from '@/components/layout/atoms/ConfirmationModal'

interface Props {
	isOpen: boolean
	brand: I_Brand | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function HardDeleteModal({ isOpen, brand, isAction, onClose, onConfirm }: Props) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='destructive'
			title='Eliminar marca'
			description='Esta acción no se puede deshacer'
			message={
				<>
					¿Estás seguro de que deseas eliminar de forma permanente la marca{' '}
					<span className='text-foreground font-semibold'>{brand?.name}</span>? Todos los productos asociados a esta
					marca perderán su clasificación permanentemente.
				</>
			}
			alertMessage='Esta acción eliminará la marca de la base de datos de forma permanente.'
			isProcessing={isAction}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmText='Ok, eliminar'
			cancelText='No, cancelar'
		/>
	)
}
