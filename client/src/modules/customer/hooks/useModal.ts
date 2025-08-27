import { useState, useCallback } from 'react'
import { I_Customer } from '@/common/types/modules/customer'
import { ModalState, ModalType } from '@/modules/customer/types/modal'

export const useModal = () => {
	const [state, setState] = useState<ModalState>({
		type: null,
		isOpen: false,
		record: null,
		isLoading: false,
	})

	const openModal = useCallback((type: ModalType, record?: I_Customer) => {
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
		openEdit: (record: I_Customer) => openModal('edit', record),
		openHardDelete: (record: I_Customer) => openModal('hardDelete', record),
		openSoftDelete: (record: I_Customer) => openModal('softDelete', record),
		openRestore: (record: I_Customer) => openModal('restore', record),
	}
}
