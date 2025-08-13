import { useGenericApi } from '@/common/hooks/useGenericApi'
import { CUSTOMER_ENDPOINTS_CONFIG } from '@/common/configs/api/customer-endpoints.config'
import { I_Customer } from '@/common/types/modules/customer'
// I'm assuming these types exist. I will have to create them if they don't.
// import { I_Purchase, I_Sale, I_Quote, I_Proforma } from '@/common/types/modules/sales'

export const useCustomerDetail = (customerId: string) => {
	const genericApi = useGenericApi(CUSTOMER_ENDPOINTS_CONFIG)

	const { data: customer, isLoading: isLoadingCustomer } = genericApi.useCustomQueryEndpoint('getById', {
		urlParams: { id: customerId },
	})

	const { data: purchases, isLoading: isLoadingPurchases } = genericApi.useCustomQueryEndpoint('getPurchases', {
		urlParams: { id: customerId },
	})

	const { data: sales, isLoading: isLoadingSales } = genericApi.useCustomQueryEndpoint('getSales', {
		urlParams: { id: customerId },
	})

	const { data: quotes, isLoading: isLoadingQuotes } = genericApi.useCustomQueryEndpoint('getQuotes', {
		urlParams: { id: customerId },
	})

	const { data: proformas, isLoading: isLoadingProformas } = genericApi.useCustomQueryEndpoint('getProformas', {
		urlParams: { id: customerId },
	})

	return {
		customer: customer as I_Customer | undefined,
		purchases,
		sales,
		quotes,
		proformas,
		isLoading:
			isLoadingCustomer || isLoadingPurchases || isLoadingSales || isLoadingQuotes || isLoadingProformas,
	}
}
