import { useState, useCallback } from 'react'
import { I_Supplier } from '@/common/types/modules/supplier'
import { ModalState, ModalType } from '@/modules/supplier/types/modal'

export const useModal = () => {
	const [state, setState] = useState<ModalState>({
		type: null,
		isOpen: false,
		record: null,
		isLoading: false,
	})

	const openModal = useCallback((type: ModalType, record?: I_Supplier) => {
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
		openEdit: (record: I_Supplier) => openModal('edit', record),
		openHardDelete: (record: I_Supplier) => openModal('hardDelete', record),
		openSoftDelete: (record: I_Supplier) => openModal('softDelete', record),
		openRestore: (record: I_Supplier) => openModal('restore', record),
	}
}
