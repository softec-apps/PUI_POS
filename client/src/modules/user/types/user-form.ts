import { z } from 'zod'
import { I_User } from '@/common/types/modules/user'
import { validateCedula } from '@/common/utils/ecValidation-util'

const BaseUserSchema = z.object({
	firstName: z.string().nonempty('Campo requerido').min(2, 'Mínimo 2 caracteres').max(255, 'Máximo 255 caracteres'),
	lastName: z.string().nonempty('Campo requerido').min(2, 'Mínimo 2 caracteres').max(255, 'Máximo 255 caracteres'),
	email: z.string().nonempty('Campo requerido').email('Email inválido'),
	photo: z.string().optional(),
	roleId: z.string().nonempty('Selecciona un rol'),
	dni: z
		.string()
		.nonempty('No puede estar vacío')
		.refine(value => /^\d*$/.test(value), {
			message: 'Formato inválido (solo números)',
		})
		.refine(value => value.length === 10 || value.length === 13, {
			message: 'Debe tener 10 o 13 dígitos',
		})
		.refine(
			value => {
				// Validar cédula si es de 10 dígitos
				if (value.length === 10) {
					try {
						return validateCedula(value)
					} catch (error) {
						console.error('Error validando cédula:', error)
						return false
					}
				}

				return false
			},
			{
				message: 'Cédula o RUC inválido',
			}
		),
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
	}).superRefine((data, ctx) => {
		// Si está editando y no cambia la contraseña, no validar coincidencia
		if (isEditing && !data.password) return

		if (data.password !== data.passwordConfirm) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Las contraseñas no coinciden',
				path: ['password'],
			})
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Las contraseñas no coinciden',
				path: ['passwordConfirm'],
			})
		}
	})
}

export type UserFormData = z.infer<ReturnType<typeof createUserSchema>>

export interface UserFormProps {
	isOpen: boolean
	currentRecord?: I_User
	onClose: () => void
	onSubmit: (data: UserFormData) => Promise<void>
}
