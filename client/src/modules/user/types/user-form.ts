import { z } from 'zod'
import { I_User } from '@/common/types/modules/user'

const BaseUserSchema = z.object({
	firstName: z.string().nonempty('Campo requerido').min(2, 'Mínimo 2 caracteres').max(255, 'Máximo 255 caracteres'),
	lastName: z.string().nonempty('Campo requerido').min(2, 'Mínimo 2 caracteres').max(255, 'Máximo 255 caracteres'),
	email: z.string().nonempty('Campo requerido').email('Email inválido'),
	photo: z.string().optional(),
	roleId: z.string().nonempty('Selecciona un rol'),
})

export const createUserSchema = (isEditing: boolean) => {
	return BaseUserSchema.extend({
		statusId: isEditing ? z.string().nonempty('Selecciona un estado') : z.string().optional(),

		password: isEditing
			? z.string().min(8, 'Mínimo 8 caracteres').max(16, 'Máximo 16 caracteres').optional()
			: z.string().nonempty('Campo requerido').min(8, 'Mínimo 8 caracteres').max(12, 'Máximo 12 caracteres'),

		passwordConfirm: isEditing
			? z.string().min(8, 'Mínimo 8 caracteres').max(12, 'Máximo 12 caracteres').optional()
			: z.string().nonempty('Campo requerido').min(8, 'Mínimo 8 caracteres').max(12, 'Máximo 12 caracteres'),
	}).refine(
		data => {
			if (!isEditing || (isEditing && data.password)) return data.password === data.passwordConfirm
			return true
		},
		{
			message: 'Las contraseñas no coinciden',
			path: ['passwordConfirm'],
		}
	)
}

export type UserFormData = z.infer<ReturnType<typeof createUserSchema>>

export interface UserFormProps {
	isOpen: boolean
	currentRecord?: I_User
	onClose: () => void
	onSubmit: (data: UserFormData) => Promise<void>
}
