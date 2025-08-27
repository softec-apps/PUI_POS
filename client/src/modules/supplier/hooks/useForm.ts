import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supplierSchema, SupplierFormData } from '@/modules/supplier/types/supplier-form'

export function useSupplierForm({ isEditing }: { isEditing: boolean }) {
	const form = useForm<SupplierFormData>({
		resolver: zodResolver(supplierSchema(isEditing)),
		defaultValues: {
			ruc: '',
			legalName: '',
			commercialName: '',
			status: '',
		},
		mode: 'onChange',
	})

	const resetForm = () => form.reset()

	return {
		form,
		setValue: form.setValue,
		watch: form.watch,
		resetForm,
	}
}
