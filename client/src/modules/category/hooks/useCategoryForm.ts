import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema, CategoryFormData } from '@/modules/category/types/category-form'

export function useCategoryForm({ isEditing }: { isEditing: boolean }) {
	const form = useForm<CategoryFormData>({
		resolver: zodResolver(categorySchema(isEditing)),
		defaultValues: {
			name: '',
			description: '',
			photo: '',
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
