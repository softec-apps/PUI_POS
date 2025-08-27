import { useState, useCallback } from 'react'
import { I_Category } from '@/common/types/modules/category'
import { ModalState, ModalType } from '@/modules/category/types/modal'

export const useModal = () => {
	const [state, setState] = useState<ModalState>({
		type: null,
		isOpen: false,
		record: null,
		isLoading: false,
	})

	const openModal = useCallback((type: ModalType, record?: I_Category) => {
		setState({
			type,
			isOpen: true,
			record: record || null,
			isLoading: false,
		})
	}, [])

	const closeModal = useCallback(() => setState(prev => ({ ...prev, isOpen: false })), [])

	const setLoading = useCallback((isLoading: boolean) => setState(prev => ({ ...prev, isLoading })), [])

	return {
		...state,

		openModal,
		closeModal,
		setLoading,

		openCreate: () => openModal('create'),
		openEdit: (record: I_Category) => openModal('edit', record),
		openHardDelete: (record: I_Category) => openModal('hardDelete', record),
		openSoftDelete: (record: I_Category) => openModal('softDelete', record),
		openRestore: (record: I_Category) => openModal('restore', record),
	}
}
