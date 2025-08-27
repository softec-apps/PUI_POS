import { useState, useCallback } from 'react'
import { I_User } from '@/common/types/modules/user'
import { ModalState, ModalType } from '@/modules/user/types/modal'

export const useModal = () => {
	const [state, setState] = useState<ModalState>({
		type: null,
		isOpen: false,
		record: null,
		isLoading: false,
	})

	const openModal = useCallback((type: ModalType, record?: I_User) => {
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
		openEdit: (record: I_User) => openModal('edit', record),
		openHardDelete: (record: I_User) => openModal('hardDelete', record),
		openSoftDelete: (record: I_User) => openModal('softDelete', record),
		openRestore: (record: I_User) => openModal('restore', record),
	}
}
