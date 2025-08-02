'use client'

import Link from 'next/link'
import { ROUTE_PATH } from '@/common/constants/routes-const'

export function TermsConditions() {
	return (
		<div className='flex flex-col gap-6'>
			<div className='text-muted-foreground [&_a]:hover:text-primary space-x-2 text-center text-xs text-balance [&_a]:underline [&_a]:underline-offset-4'>
				<p>
					Al hacer clic en continuar, aceptas nuestros{' '}
					<Link href={ROUTE_PATH.PUBLIC.PRIVACY_POLICY}>Términos de servicio</Link> y{' '}
					<Link href={ROUTE_PATH.PUBLIC.TERMS_OF_SERVICE}>Política de privacidad</Link>, y recibir correos electrónicos
					periódicos con actualizaciones.
				</p>
			</div>
		</div>
	)
}
