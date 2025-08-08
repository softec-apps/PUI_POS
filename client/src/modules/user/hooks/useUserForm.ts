import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserSchema, UserFormData } from '@/modules/user/types/user-form'

export function useUserForm({ isEditing }: { isEditing: boolean }) {
	const form = useForm<UserFormData>({
		resolver: zodResolver(createUserSchema(isEditing)),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			photo: '',
			roleId: '',
			statusId: '',
		},
		mode: 'onChange',
	})

	const resetForm = () => form.reset()

	return {
		form,
		resetForm,
	}
}
