'use client'

import { I_Supplier } from '@/common/types/modules/supplier'
import { ConfirmationModal } from '@/components/layout/templates/ConfirmationModal'

interface HardDeleteModalProps {
	isOpen: boolean
	currentRecord: I_Supplier | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function HardDeleteModal({ isOpen, currentRecord, isAction, onClose, onConfirm }: HardDeleteModalProps) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='destructive'
			title='Eliminar proveedor'
			description='Esta acción no se puede deshacer'
			message={
				<>
					¿Deseas eliminar permanentemente el proveedor{' '}
					<span className='text-foreground font-semibold'>{currentRecord?.legalName}</span>?
				</>
			}
			alertMessage={
				<>
					<p className='text-destructive'>Esta proveedor será eliminado de forma permanente y no podrá recuperarse.</p>
					<p className='text-destructive'>Todos los productos relacionados quedarán sin proveedor asignado.</p>
				</>
			}
			confirmKey={currentRecord?.legalName}
			isProcessing={isAction}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmText='Eliminar'
			cancelText='Cancelar'
		/>
	)
}
