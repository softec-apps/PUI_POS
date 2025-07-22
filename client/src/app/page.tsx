import { redirect } from 'next/navigation'
import { ROUTE_PATH } from '@/common/constants/routes-const'

export default async function RootPage() {
	redirect(`${ROUTE_PATH.AUTH.SIGNIN}`)
}
