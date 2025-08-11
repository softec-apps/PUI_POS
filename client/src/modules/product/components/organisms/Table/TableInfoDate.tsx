'use client'

import { Icons } from '@/components/icons'
import { I_Product } from '@/common/types/modules/product'
import { formatDate } from '@/common/utils/dateFormater-util'

interface TableInfoDateProps {
	recordData: I_Product
}

export const TableInfoDate = ({ recordData }: TableInfoDateProps) => {
	return (
		<div className='text-primary space-y-1 text-xs'>
			{recordData?.deletedAt ? (
				<div className='text-destructive flex items-center gap-1 font-medium'>
					<Icons.trash size={14} />
					<span>{formatDate(recordData?.deletedAt, true)}</span>
				</div>
			) : (
				<div className='space-y-1.5'>
					<div className='text-primary flex items-center gap-1'>
						<Icons.calendar size={14} />
						<span>{formatDate(recordData?.createdAt, true)}</span>
					</div>

					<div className='text-primary flex items-center gap-1'>
						<Icons.edit size={14} />
						<span>{formatDate(recordData?.updatedAt, true)}</span>
					</div>
				</div>
			)}
		</div>
	)
}
