'use client'

import { I_Supplier } from '@/common/types/modules/supplier'
import { ConfirmationModal } from '@/components/layout/atoms/ConfirmationModal'

interface Props {
	isOpen: boolean
	currentRecord: I_Supplier | null
	isAction: boolean
	onClose: () => void
	onConfirm: () => Promise<void>
}

export function HardDeleteModal({ isOpen, currentRecord, isAction, onClose, onConfirm }: Props) {
	return (
		<ConfirmationModal
			isOpen={isOpen}
			variant='destructive'
			title='Eliminar atributo'
			description='Esta acción es irreversible.'
			message={
				<>
					¿Confirma que desea eliminar permanentemente el proveedor{' '}
					<span className='text-foreground font-semibold'>{currentRecord?.legalName}</span>? Este proveedor está en uso
					y será removido de todos los productos asociados.
				</>
			}
			alertMessage='Esta acción eliminará el proveedor del sistema de forma permanente.'
			isProcessing={isAction}
			onClose={onClose}
			onConfirm={onConfirm}
			confirmText='Ok, eliminar'
			cancelText='No, cancelar'
		/>
	)
}
