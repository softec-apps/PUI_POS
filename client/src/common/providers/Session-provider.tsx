'use client'

import { SessionProvider } from 'next-auth/react'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider
		//refetchInterval={60 * 15} // Refrescar cada 15 minutos
		//refetchOnWindowFocus={true} // Refrescar cuando la ventana recibe el foco
		>
			{children}
		</SessionProvider>
	)
}
