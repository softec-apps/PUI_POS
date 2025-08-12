'use client'

import { ModalState } from '@/modules/customer/types/modalState'
import { RestoreModal } from '@/modules/customer/components/organisms/Modal/ModalRestore'
import { SoftDeleteModal } from '@/modules/customer/components/organisms/Modal/ModalSoftDelete'
import { HardDeleteModal } from '@/modules/customer/components/organisms/Modal/ModalHardDelete'
import { CustomerFormModal } from '@/modules/customer/components/organisms/Modal/ModalCustomerForm'

interface CustomerModalsProps {
	modalState: ModalState
	customerHandlers: any
}

export function CustomerModals({ modalState, customerHandlers }: CustomerModalsProps) {
	return (
		<>
			<CustomerFormModal
				isOpen={modalState.isDialogOpen}
				currentRecord={modalState.currentRecord}
				onClose={customerHandlers.handleDialogClose}
				onSubmit={customerHandlers.handleFormSubmit}
				onFileChange={customerHandlers.handleFileChange}
				onClearPreview={customerHandlers.handleClearPreview}
			/>

			<SoftDeleteModal
				isOpen={modalState.isSoftDeleteModalOpen}
				customer={modalState.customerToDelete}
				isSoftDeleting={modalState.isSoftDeleting}
				onClose={modalState.closeSoftDeleteModal}
				onConfirm={customerHandlers.handleConfirmSoftDelete}
			/>

			<RestoreModal
				isOpen={modalState.isRestoreModalOpen}
				customer={modalState.customerToRestore}
				isRestoring={modalState.isRestoring}
				onClose={modalState.closeRestoreModal}
				onConfirm={customerHandlers.handleConfirmRestore}
			/>

			<HardDeleteModal
				isOpen={modalState.isHardDeleteModalOpen}
				customer={modalState.customerToHardDelete}
				isAction={modalState.isHardDeleting}
				onClose={modalState.closeHardDeleteModal}
				onConfirm={customerHandlers.handleConfirmHardDelete}
			/>
		</>
	)
}
