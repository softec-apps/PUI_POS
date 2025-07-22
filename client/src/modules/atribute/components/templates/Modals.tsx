'use client'

import { ModalState } from '@/modules/atribute/types/modalState'
import { HardDeleteModal } from '@/modules/atribute/components/organisms/Modal/ModalHardDelete'
import { AttributeFormModal } from '@/modules/atribute/components/organisms/Modal/ModalAttributeForm'

interface Props {
	modalState: ModalState
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	atributesHandlers: any
}

export function AttributeModals({ modalState, atributesHandlers }: Props) {
	return (
		<>
			<AttributeFormModal
				isOpen={modalState.isDialogOpen}
				currentRecord={modalState.currentRecord}
				onClose={atributesHandlers.handleDialogClose}
				onSubmit={atributesHandlers.handleFormSubmit}
			/>

			<HardDeleteModal
				isOpen={modalState.isHardDeleteModalOpen}
				currentRecord={modalState.attributeToHardDelete}
				isAction={modalState.isHardDeleting}
				onClose={modalState.closeHardDeleteModal}
				onConfirm={atributesHandlers.handleConfirmHardDelete}
			/>
		</>
	)
}
