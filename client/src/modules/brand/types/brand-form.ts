import { z } from 'zod'
import { I_Brand } from '@/common/types/modules/brand'

const BaseBrandSchema = z.object({
	name: z.string().max(50, 'Límite de 50 caracteres excedido').nonempty('No puede estar vacío'),
	description: z.string().max(300, 'Límite de 300 caracteres excedido').optional(),
})

// Schema extendido para creación/edición
export const brandSchema = (isEditing: boolean) => {
	return BaseBrandSchema.extend({
		status: isEditing ? z.string().nonempty('Selecciona un estado') : z.string().optional().default('active'),
	})
}

export type BrandFormData = z.infer<ReturnType<typeof brandSchema>>

export interface BrandFormProps {
	isOpen: boolean
	currentRecord?: I_Brand
	onClose: () => void
	onSubmit: (data: BrandFormData) => Promise<void>
}
