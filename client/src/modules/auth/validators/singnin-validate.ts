import { z } from 'zod'

export const formSchema = z.object({
	field_email: z.string(),
	field_pass: z.string().min(1),
})
