import { z } from 'zod'
import { I_Brand } from '@/modules/brand/types/brand'

export const brandSchema = z.object({
	name: z.string().min(3, 'Mínimo 3 caracteres').max(50, 'Máximo 50 caracteres'),
	description: z.string().max(300, 'Máximo 300 caracteres').optional().or(z.literal('')),
})

export type brandFormData = z.infer<typeof brandSchema>

export interface TemplateFormProps {
	isOpen: boolean
	currentbrand?: I_Brand
	onClose: () => void
	onSubmit: (data: brandFormData) => Promise<void>
}
