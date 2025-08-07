import { z } from 'zod'
import { I_Template } from '@/common/types/modules/template'

export const templateSchema = z.object({
	name: z
		.string()
		.min(1, 'El nombre es requerido')
		.min(3, 'Mínimo 3 caracteres')
		.max(100, 'Máximo 100 caracteres')
		.regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Solo letras, números, espacios y algunos símbolos'),
	description: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
	categoryId: z.string().uuid('Selecciona una categoría válida'),
	atributeIds: z
		.array(z.string().uuid('ID de atributo inválido'), { required_error: 'Selecciona al menos 1 atributo' })
		.min(1, 'Selecciona al menos 1 atributo')
		.max(20, 'Máximo 20 atributos'),
})

export type TemplateFormData = z.infer<typeof templateSchema>

export interface TemplateFormProps {
	isOpen: boolean
	currentTemplate?: I_Template
	onClose: () => void
	onSubmit: (data: TemplateFormData) => Promise<void>
}
