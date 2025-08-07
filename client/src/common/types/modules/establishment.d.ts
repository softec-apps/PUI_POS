import { I_Photo } from '@/common/types/photo'
import { I_MetaPagination, I_MetaResponse } from '@/common/types/pagination'

export interface I_Accounting {
	SI: string
	NO: string
}

export interface I_EnvironmentType {
	1: number // 1 = Pruebas, 2 = Producción
	2: number
}

export interface I_TypeIssue {
	1: number // 1 = Emisión normal
}

interface I_EstablishmentId {
	id: string
}

interface I_BaseEstablishment extends I_EstablishmentId {
	createdAt: string
	updatedAt: string
}

export interface I_Establishment extends I_BaseEstablishment {
	accounting: keyof I_Accounting
	addressIssuingEstablishment: string
	companyName: string
	environmentType: keyof I_EnvironmentType
	resolutionNumber: number
	ruc: number
	tradeName: string
	typeIssue: keyof I_TypeIssue
	issuingEstablishmentCode?: number
	issuingPointCode?: number
	parentEstablishmentAddress?: string
	photo?: I_Photo
}

export interface I_CreateEstablishment {
	accounting: keyof I_Accounting
	addressIssuingEstablishment: string
	companyName: string
	environmentType: keyof I_EnvironmentType
	resolutionNumber: number
	ruc: number
	tradeName: string
	typeIssue: keyof I_TypeIssue
	issuingEstablishmentCode?: number
	issuingPointCode?: number
	parentEstablishmentAddress?: string
	photo?: I_Photo | null
}

export interface I_UpdateEstablishment {
	accounting: keyof I_Accounting
	addressIssuingEstablishment: string
	companyName: string
	environmentType: keyof I_EnvironmentType
	resolutionNumber: number
	ruc: number
	tradeName: string
	typeIssue: keyof I_TypeIssue
	issuingEstablishmentCode?: number
	issuingPointCode?: number
	parentEstablishmentAddress?: string
	photo?: I_Photo | null
}

export interface I_EstablishmentResponse {
	success: boolean
	statusCode: number
	message: string
	data: {
		items: I_Establishment[]
		pagination: I_MetaPagination
	}
	meta: I_MetaResponse
}
