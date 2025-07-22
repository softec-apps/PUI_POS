'use client'

import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'

export function SesionProvider({ children }: { children: ReactNode }) {
	return <SessionProvider>{children}</SessionProvider>
}
