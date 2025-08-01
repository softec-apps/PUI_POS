'use client'

import { ModalState } from '@/modules/product/types/modalState'
import { HardDeleteModal } from '@/modules/product/components/organisms/Modal/ModalHardDelete'
import { RecordFormModal } from '@/modules/product/components/organisms/Modal/ModalForm'

interface Props {
	modalState: ModalState
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	recordHandlers: any
}

export function ModalsProduct({ modalState, recordHandlers }: Props) {
	return (
		<>
			<RecordFormModal
				isOpen={modalState.isDialogOpen}
				currentRecord={modalState.currentRecord}
				onClose={recordHandlers.handleDialogClose}
				onSubmit={recordHandlers.handleFormSubmit}
			/>

			<HardDeleteModal
				isOpen={modalState.isHardDeleteModalOpen}
				currentRecord={modalState.recordToHardDelete}
				isAction={modalState.isHardDeleting}
				onClose={modalState.closeHardDeleteModal}
				onConfirm={recordHandlers.handleConfirmHardDelete}
			/>
		</>
	)
}
