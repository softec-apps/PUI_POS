import { z } from 'zod'
import { I_Category } from '@/common/types/modules/category'

export const categorySchema = z.object({
	name: z
		.string()
		.min(3, 'El nombre debe tener al menos 3 caracteres')
		.max(100, 'El nombre no puede exceder 100 caracteres'),
	description: z
		.string()
		.min(3, 'El nombre debe tener al menos 3 caracteres')
		.max(255, 'La descripción no puede exceder 255 caracteres')
		.optional()
		.or(z.literal('')),
	photo: z.string().optional(),
})

export type CategoryFormData = z.infer<typeof categorySchema>

export interface TemplateFormProps {
	isOpen: boolean
	currentCategory?: I_Category
	onClose: () => void
	onSubmit: (data: CategoryFormData) => Promise<void>
}
