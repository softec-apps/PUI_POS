import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { brandSchema, BrandFormData } from '@/modules/brand/types/brand-form'

export function useBrandForm({ isEditing }: { isEditing: boolean }) {
	const form = useForm<BrandFormData>({
		resolver: zodResolver(brandSchema(isEditing)),
		defaultValues: {
			name: '',
			description: '',
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
