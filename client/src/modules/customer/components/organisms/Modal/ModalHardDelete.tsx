'use client'

import { I_Customer } from '@/common/types/modules/customer'
import { ConfirmationModal } from '@/components/layout/atoms/ConfirmationModal'

interface Props {
	isOpen: boolean
	customer: I_Customer | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function HardDeleteModal({ isOpen, customer, isAction, onClose, onConfirm }: Props) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='destructive'
			title='Eliminar Cliente'
			description='Esta acción no se puede deshacer.'
			message={
				<>
					¿Estás seguro de que deseas eliminar de forma permanente al cliente{' '}
					<span className='text-foreground font-semibold'>{customer?.firstName} {customer?.lastName}</span>?
				</>
			}
			alertMessage='Esta acción eliminará el cliente de la base de datos de forma permanente.'
			isProcessing={isAction}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmText='Sí, eliminar'
			cancelText='No, cancelar'
		/>
	)
}
