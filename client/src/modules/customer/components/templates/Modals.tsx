'use client'

import { ModalState } from '@/modules/customer/types/modalState'
import { HardDeleteModal } from '@/modules/customer/components/organisms/Modal/ModalHardDelete'
import { CustomerFormModal } from '@/modules/customer/components/organisms/Modal/ModalCustomerForm'
import { CustomerHandlers } from '@/modules/customer/hooks/useCustomerHandlers'

interface CustomerModalsProps {
	modalState: ModalState
	customerHandlers: CustomerHandlers
}

export function CustomerModals({ modalState, customerHandlers }: CustomerModalsProps) {
	return (
		<>
			<CustomerFormModal
				isOpen={modalState.isDialogOpen}
				currentCustomer={modalState.currentRecord}
				onClose={customerHandlers.handleDialogClose}
				onSubmit={customerHandlers.handleFormSubmit}
			/>

			<HardDeleteModal
				isOpen={modalState.isHardDeleteModalOpen}
				customer={modalState.recordToHardDelete}
				isAction={modalState.isHardDeleting}
				onClose={modalState.closeHardDeleteModal}
				onConfirm={customerHandlers.handleConfirmHardDelete}
			/>
		</>
	)
}
