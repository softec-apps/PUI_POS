import { z } from 'zod'
import { I_Brand } from '@/modules/brand/types/brand'

export const brandSchema = z.object({
	name: z
		.string()
		.min(3, 'El nombre debe tener al menos 3 caracteres')
		.max(100, 'El nombre no puede exceder 100 caracteres'),
	description: z
		.string()
		.max(255, 'La descripción no puede exceder 255 caracteres')
		.optional()
		.or(z.literal('')),
})

export type brandFormData = z.infer<typeof brandSchema>

export interface TemplateFormProps {
	isOpen: boolean
	currentbrand?: I_Brand
	onClose: () => void
	onSubmit: (data: brandFormData) => Promise<void>
}
