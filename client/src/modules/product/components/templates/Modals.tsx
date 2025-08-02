'use client'

import { ModalState } from '@/modules/product/types/modalState'
import { HardDeleteModal } from '@/modules/product/components/organisms/Modal/ModalHardDelete'
import { ProductFormModal } from '@/modules/product/components/organisms/Modal/ModalProductForm'

interface ProductModalsProps {
	modalState: ModalState
	productHandlers: any
}

export function ProductModals({ modalState, productHandlers }: ProductModalsProps) {
	return (
		<>
			<ProductFormModal
				isOpen={modalState.isDialogOpen}
				currentRecord={modalState.currentRecord}
				onClose={productHandlers.handleDialogClose}
				onSubmit={productHandlers.handleFormSubmit}
			/>

			<HardDeleteModal
				isOpen={modalState.isHardDeleteModalOpen}
				currentRecord={modalState.recordToHardDelete}
				isAction={modalState.isHardDeleting}
				onClose={modalState.closeHardDeleteModal}
				onConfirm={productHandlers.handleConfirmHardDelete}
			/>
		</>
	)
}
