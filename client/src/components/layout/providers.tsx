'use client'

import React from 'react'
import AuthProvider from '@/common/providers/Session-provider'
import { ThemeProvider } from '@/common/providers/Theme-provider'
import { InterceptorStatusCode } from '../InterceptorStatusCode'
import { QueryProvider } from '@/common/providers/Query-provider'
import { SchemaAthemesProvider } from '@/common/providers/SchemaThemes-provider'

interface Props {
	activeThemeValue: string
	children: React.ReactNode
}

export default function Providers({ activeThemeValue, children }: Props) {
	return (
		<QueryProvider>
			<SchemaAthemesProvider initialTheme={activeThemeValue}>
				<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange enableColorScheme>
					<AuthProvider>
						<InterceptorStatusCode>{children}</InterceptorStatusCode>
					</AuthProvider>
				</ThemeProvider>
			</SchemaAthemesProvider>
		</QueryProvider>
	)
}
