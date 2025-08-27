import { z } from 'zod'
import { I_Category } from '@/common/types/modules/category'

const BaseCategorySchema = z.object({
	name: z
		.string()
		.nonempty('Campo requerido')
		.min(3, 'El nombre debe tener al menos 3 caracteres')
		.max(100, 'El nombre no puede exceder 100 caracteres'),

	description: z
		.string()
		.max(255, 'La descripción no puede exceder 255 caracteres')
		.transform(val => (val === '' ? null : val))
		.nullable()
		.optional(),

	photo: z.string().optional(),
})

// Schema extendido para creación/edición
export const categorySchema = (isEditing: boolean) => {
	return BaseCategorySchema.extend({
		status: isEditing ? z.string().nonempty('Selecciona un estado') : z.string().optional().default('active'),
	})
}

export type CategoryFormData = z.infer<ReturnType<typeof categorySchema>>

export interface CategoryFormProps {
	isOpen: boolean
	currentRecord?: I_Category
	onClose: () => void
	onSubmit: (data: CategoryFormData) => Promise<void>
}
