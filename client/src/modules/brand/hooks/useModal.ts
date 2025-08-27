import { useState, useCallback } from 'react'
import { I_Brand } from '@/common/types/modules/brand'
import { ModalState, ModalType } from '@/modules/brand/types/modal'

export const useModal = () => {
	const [state, setState] = useState<ModalState>({
		type: null,
		isOpen: false,
		record: null,
		isLoading: false,
	})

	const openModal = useCallback((type: ModalType, record?: I_Brand) => {
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
		openEdit: (record: I_Brand) => openModal('edit', record),
		openHardDelete: (record: I_Brand) => openModal('hardDelete', record),
		openSoftDelete: (record: I_Brand) => openModal('softDelete', record),
		openRestore: (record: I_Brand) => openModal('restore', record),
	}
}
