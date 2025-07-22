'use client'

import { ModalState } from '@/modules/category/types/modalState'
import { RestoreModal } from '@/modules/category/components/organisms/Modal/ModalRestore'
import { SoftDeleteModal } from '@/modules/category/components/organisms/Modal/ModalSoftDelete'
import { HardDeleteModal } from '@/modules/category/components/organisms/Modal/ModalHardDelete'
import { CategoryFormModal } from '@/modules/category/components/organisms/Modal/ModalCategoryForm'

interface Props {
	modalState: ModalState
	previewImage: any
	isUploading: boolean
	fileInputRef: any
	categoryHandlers: any
	triggerFileInput: () => void
}

export function CategoryModals({
	modalState,
	previewImage,
	isUploading,
	fileInputRef,
	categoryHandlers,
	triggerFileInput,
}: Props) {
	return (
		<>
			<CategoryFormModal
				isOpen={modalState.isDialogOpen}
				currentCategory={modalState.currentRecord}
				previewImage={previewImage}
				isUploading={isUploading}
				fileInputRef={fileInputRef}
				onClose={categoryHandlers.handleDialogClose}
				onSubmit={categoryHandlers.handleFormSubmit}
				onFileChange={categoryHandlers.handleFileChange}
				onTriggerFileInput={triggerFileInput}
				onClearPreview={categoryHandlers.handleClearPreview}
			/>

			<SoftDeleteModal
				isOpen={modalState.isSoftDeleteModalOpen}
				category={modalState.categoryToDelete}
				isSoftDeleting={modalState.isSoftDeleting}
				onClose={modalState.closeSoftDeleteModal}
				onConfirm={categoryHandlers.handleConfirmSoftDelete}
			/>

			<RestoreModal
				isOpen={modalState.isRestoreModalOpen}
				category={modalState.categoryToRestore}
				isRestoring={modalState.isRestoring}
				onClose={modalState.closeRestoreModal}
				onConfirm={categoryHandlers.handleConfirmRestore}
			/>

			<HardDeleteModal
				isOpen={modalState.isHardDeleteModalOpen}
				category={modalState.categoryToHardDelete}
				isAction={modalState.isHardDeleting}
				onClose={modalState.closeHardDeleteModal}
				onConfirm={categoryHandlers.handleConfirmHardDelete}
			/>
		</>
	)
}
