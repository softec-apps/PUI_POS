'use client'

import { Icons } from '@/components/icons'
import { I_Kardex } from '@/common/types/modules/kardex'
import { formatDate } from '@/common/utils/dateFormater-util'

interface InfoDateProps {
	recordData: I_Kardex
}

export const InfoDate = ({ recordData }: InfoDateProps) => {
	return (
		<div className='text-primary space-y-1 text-xs'>
			<div className='space-y-1.5'>
				<div className='text-primary flex items-center gap-1'>
					<Icons.calendar size={14} />
					<span>{formatDate(recordData?.createdAt, true)}</span>
				</div>
			</div>
		</div>
	)
}
