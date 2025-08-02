'use client'

import { formatDate } from '@/common/utils/dateFormater-util'
import { I_Product } from '@/modules/product/types/product'

interface Props {
	recordData: I_Product
}

export const TableInfoDate = ({ recordData }: Props) => (
	<div className='text-primary/95 space-y-1 text-xs'>
		<div>Creado: {formatDate(recordData.createdAt)}</div>
		<div>Editado: {formatDate(recordData.updatedAt)}</div>
	</div>
)
