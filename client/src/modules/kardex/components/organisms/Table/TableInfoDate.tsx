'use client'

import { I_Kardex } from '@/modules/kardex/types/kardex'
import { formatDate } from '@/common/utils/dateFormater-util'

interface Props {
	recordData: I_Kardex
}

export const TableInfoDate = ({ recordData }: Props) => (
	<div className='text-primary/95 space-y-1 text-xs'>
		<div>Creado: {formatDate(recordData.createdAt, true)}</div>
	</div>
)
