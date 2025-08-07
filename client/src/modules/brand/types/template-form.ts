import { z } from 'zod'
import { I_Brand } from '@/common/types/modules/brand'

export const BrandSchema = z.object({
	name: z.string().min(3, 'Mínimo 3 caracteres').max(50, 'Máximo 50 caracteres'),
	description: z.string().max(300, 'Máximo 300 caracteres').optional().or(z.literal('')),
})

export type BrandFormData = z.infer<typeof BrandSchema>

export interface TemplateFormProps {
	isOpen: boolean
	currentbrand?: I_Brand
	onClose: () => void
	onSubmit: (data: BrandFormData) => Promise<void>
}
