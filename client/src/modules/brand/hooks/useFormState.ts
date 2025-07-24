'use client'

import { useCallback, useState } from 'react'

const INITIAL_FORM_DATA: FormData = {
	name: '',
	description: '',
}

export const useFormState = (initialData: FormData = INITIAL_FORM_DATA) => {
	const [formData, setFormData] = useState<FormData>(initialData)

	const updateField = useCallback((field: keyof FormData, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }))
	}, [])

	const resetForm = useCallback(() => {
		setFormData(INITIAL_FORM_DATA)
	}, [])

	const setForm = useCallback((data: Partial<FormData>) => {
		setFormData(prev => ({ ...prev, ...data }))
	}, [])

	return { formData, updateField, resetForm, setForm }
}
