'use client'

import { I_Sale } from '@/common/types/modules/sale'
import { ConfirmationModal } from '@/components/layout/atoms/ConfirmationModal'

interface Props {
	isOpen: boolean
	sale: I_Sale | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function HardDeleteModal({ isOpen, sale, isAction, onClose, onConfirm }: Props) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='destructive'
			title='Eliminar Venta'
			description='Esta acción no se puede deshacer'
			message={
				<>
					¿Estás seguro de que deseas eliminar de forma permanente la venta con ID{' '}
					<span className='text-foreground font-semibold'>{sale?.id}</span>?
				</>
			}
			alertMessage='Esta acción eliminará la venta de la base de datos de forma permanente.'
			isProcessing={isAction}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmText='Ok, eliminar'
			cancelText='No, cancelar'
		/>
	)
}
