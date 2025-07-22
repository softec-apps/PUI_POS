export const ROUTE_PATH = {
	HOME: '/',
	PUBLIC: {
		ABOUT: '/about',
		CONTACT: '/contact',
	},
	LEGAL: {
		PRIVACY_POLICY: '/privacy-policy',
		TERMS_OF_SERVICE: '/terms-of-service',
	},
	AUTH: {
		SIGNIN: '/sign-in',
		RECOVER_PASSWORD: '/recover-password',
	},
	ADMIN: {
		DASHBOARD: '/dashboard',
		ATTRIBUTES: '/dashboard/attributes',
		TEMPLATES: '/dashboard/templates',
		CATEGORY: '/dashboard/category',
		SUPPLIER: '/dashboard/supplier',
		PRODUCT: '/dashboard/product',
		SALES: '/dashboard/sales',
		REPORTS: '/dashboard/reports',
		CUSTOMERS: '/dashboard/customers',
		USER: '/dashboard/user',
		CONFIGURATION: {
			LOCAL: '/dashboard/configuration/local',
			BILLING: '/dashboard/configuration/billing',
			PREFERENCE: '/dashboard/configuration/preferences',
			PERSONALIZATION: '/dashboard/configuration/personalization',
		},
	},
} as const

// Tipos para TypeScript
export type RoutePathAdmin = (typeof ROUTE_PATH.ADMIN)[keyof typeof ROUTE_PATH.ADMIN]
export type RoutePathAuth = (typeof ROUTE_PATH.AUTH)[keyof typeof ROUTE_PATH.AUTH]
export type RoutePathPublic = (typeof ROUTE_PATH.PUBLIC)[keyof typeof ROUTE_PATH.PUBLIC]
