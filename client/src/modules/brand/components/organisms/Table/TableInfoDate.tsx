'use client'

import { formatDate } from '@/common/utils/dateFormater-util'
import { I_Brand} from '@/modules/brand/types/brand'

interface Props {
	brandData: I_Brand
}

export const TableInfoDate = ({ brandData }: Props) => (
	<div className='text-primary/95 space-y-1 text-xs'>
		<div>Creado: {formatDate(brandData?.createdAt, true)}</div>
		<div>Editado: {formatDate(brandData?.updatedAt, true)}</div>
	</div>
)
