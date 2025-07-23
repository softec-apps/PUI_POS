'use client'

import { ModalState } from '@/modules/brand/types/modalState'
import { RestoreModal } from '@/modules/brand/components/organisms/Modal/ModalRestore'
import { SoftDeleteModal } from '@/modules/brand/components/organisms/Modal/ModalSoftDelete'
import { HardDeleteModal } from '@/modules/brand/components/organisms/Modal/ModalHardDelete'
import { BrandFormModal } from '@/modules/brand/components/organisms/Modal/ModalBrandForm'

interface Props {
	modalState: ModalState
	previewImage: any
	isUploading: boolean
	fileInputRef: any
	brandHandlers: any
	triggerFileInput: () => void
}

export function BrandModals({
	modalState,
	previewImage,
	isUploading,
	fileInputRef,
	brandHandlers,
	triggerFileInput,
}: Props) {
	return (
		<>
			<BrandFormModal
				isOpen={modalState.isDialogOpen}
				currentBrand={modalState.currentRecord} 
				previewImage={previewImage}
				isUploading={isUploading}
				fileInputRef={fileInputRef}
				onClose={brandHandlers.handleDialogClose}
				onSubmit={brandHandlers.handleFormSubmit}
				onFileChange={brandHandlers.handleFileChange}
				onTriggerFileInput={triggerFileInput}
				onClearPreview={brandHandlers.handleClearPreview}
			/>

			<SoftDeleteModal
				isOpen={modalState.isSoftDeleteModalOpen}
				brand={modalState.brandToDelete}
				isSoftDeleting={modalState.isSoftDeleting}
				onClose={modalState.closeSoftDeleteModal}
				onConfirm={brandHandlers.handleConfirmSoftDelete}
			/>

			<RestoreModal
				isOpen={modalState.isRestoreModalOpen}
				brand={modalState.brandToRestore}
				isRestoring={modalState.isRestoring}
				onClose={modalState.closeRestoreModal}
				onConfirm={brandHandlers.handleConfirmRestore}
			/>

			<HardDeleteModal
				isOpen={modalState.isHardDeleteModalOpen}
				brand={modalState.brandToHardDelete}
				isAction={modalState.isHardDeleting}
				onClose={modalState.closeHardDeleteModal}
				onConfirm={brandHandlers.handleConfirmHardDelete}
			/>
		</>
	)
}
