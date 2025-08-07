'use client'

import { formatDate } from '@/common/utils/dateFormater-util'
import { I_Supplier } from '@/common/types/modules/supplier'

interface Props {
	recordData: I_Supplier
}

export const TableInfoDate = ({ recordData }: Props) => (
	<div className='text-primary/95 space-y-1 text-xs'>
		<div>Creado: {formatDate(recordData?.createdAt, true)}</div>
		<div>Editado: {formatDate(recordData?.updatedAt, true)}</div>
	</div>
)
