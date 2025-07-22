'use client'

import { formatDate } from '@/common/utils/dateFormater-util'
import { I_Category } from '@/modules/category/types/category'

interface Props {
	categoryData: I_Category
}

export const TableInfoDate = ({ categoryData }: Props) => (
	<div className='text-primary/95 space-y-1 text-xs'>
		<div>Creado: {formatDate(categoryData?.createdAt, true)}</div>
		<div>Editado: {formatDate(categoryData?.updatedAt, true)}</div>
	</div>
)
