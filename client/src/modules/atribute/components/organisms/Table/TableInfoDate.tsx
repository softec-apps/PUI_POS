'use client'

import { formatDate } from '@/common/utils/dateFormater-util'
import { I_Attribute } from '@/common/types/modules/attribute'

interface Props {
	atributeData: I_Attribute
}

export const TableInfoDate = ({ atributeData }: Props) => (
	<div className='text-primary/95 space-y-1 text-xs'>
		<div>Creado: {formatDate(atributeData?.createdAt)}</div>
		<div>Editado: {formatDate(atributeData?.updatedAt)}</div>
	</div>
)
