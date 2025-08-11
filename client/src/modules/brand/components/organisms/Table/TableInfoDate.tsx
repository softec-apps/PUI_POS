'use client'

import { formatDate } from '@/common/utils/dateFormater-util'
import { I_Brand } from '@/common/types/modules/brand'
import { Icons } from '@/components/icons'

interface TableInfoDateProps {
	recordData: I_Brand
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
					<div className='text-muted-foreground flex items-center gap-1'>
						<Icons.calendar size={14} />
						<span>{formatDate(recordData?.createdAt, true)}</span>
					</div>

					<div className='text-muted-foreground flex items-center gap-1'>
						<Icons.edit size={14} />
						<span>{formatDate(recordData?.updatedAt, true)}</span>
					</div>
				</div>
			)}
		</div>
	)
}
