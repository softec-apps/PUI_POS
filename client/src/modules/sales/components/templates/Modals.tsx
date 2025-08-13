'use client'

import { useModalState } from '@/modules/sales/hooks/useModalState'
import { HardDeleteModal } from '@/modules/sales/components/organisms/Modal/ModalHardDelete'
import { SaleFormModal } from '@/modules/sales/components/organisms/Modal/ModalSaleForm'

interface Props {
	modalState: ReturnType<typeof useModalState>
	saleHandlers: any
}

export function SalesModals({
	modalState,
	saleHandlers,
}: Props) {
	return (
		<>
			<SaleFormModal
				isOpen={modalState.isDialogOpen}
				currentSale={modalState.currentRecord}
				onClose={saleHandlers.handleDialogClose}
				onSubmit={saleHandlers.handleFormSubmit}
			/>

			<HardDeleteModal
				isOpen={modalState.isHardDeleteModalOpen}
				sale={modalState.saleToHardDelete}
				isAction={modalState.isHardDeleting}
				onClose={modalState.closeHardDeleteModal}
				onConfirm={saleHandlers.handleConfirmHardDelete}
			/>
		</>
	)
}
