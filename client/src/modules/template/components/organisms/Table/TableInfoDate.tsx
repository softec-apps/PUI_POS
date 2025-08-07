'use client'

import { formatDate } from '@/common/utils/dateFormater-util'
import { I_Template } from '@/common/types/modules/template'

interface Props {
	recordData: I_Template
}

export const TableInfoDate = ({ recordData }: Props) => (
	<div className='text-primary/95 space-y-1 text-xs'>
		<div>Creado: {formatDate(recordData.createdAt)}</div>
		<div>Editado: {formatDate(recordData.updatedAt)}</div>
	</div>
)
