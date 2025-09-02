import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CustomerType, IdentificationType } from '@/common/enums/customer.enum'
import { customerSchema, CustomerFormData } from '@/modules/customer/types/customer-form'

export function useCustomerForm({ isEditing }: { isEditing: boolean }) {
	const form = useForm<CustomerFormData>({
		resolver: zodResolver(customerSchema(isEditing)),
		defaultValues: {
			identificationType: IdentificationType.IDENTIFICATION_CARD,
			identificationNumber: '',
			email: '',
			firstName: '',
			lastName: '',
			phone: '',
			address: '',
			customerType: CustomerType.REGULAR,
		},
		mode: 'onChange',
	})

	const resetForm = () => form.reset()

	return {
		form,
		setValue: form.setValue,
		watch: form.watch,
		resetForm,
	}
}
