import { MetaDataPagination, MetaResponse } from '@/common/types/pagination'

export interface I_ReportItem {
    [key: string]: any;
}

export interface I_ReportResponse {
	success: boolean
	statusCode: number
	message: string
	data: {
		items: I_ReportItem[]
		pagination: MetaDataPagination
	}
	meta: MetaResponse
}
