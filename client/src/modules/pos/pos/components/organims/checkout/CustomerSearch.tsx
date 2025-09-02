'use client'

import { Icons } from '@/components/icons'
import { Input } from '@/components/ui/input'
import { ActionButton } from '@/components/layout/atoms/ActionButton'

interface CustomerSearchProps {
	searchValue: string
	onSearchChange: (value: string) => void
	onShowNewForm: () => void
}

export const CustomerSearch: React.FC<CustomerSearchProps> = ({ searchValue, onSearchChange, onShowNewForm }) => (
	<div className='flex items-center justify-between gap-4'>
		<div className='relative w-full sm:w-64'>
			<Icons.search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
			<Input
				placeholder='Buscar cliente...'
				value={searchValue}
				onChange={e => onSearchChange(e.target.value)}
				className='bg-card h-10 pl-9 !text-base shadow-none'
			/>

			{searchValue && (
				<ActionButton
					onClick={() => onSearchChange('')}
					icon={<Icons.x />}
					variant='secondary'
					size='xs'
					className='text-muted-foreground hover:text-foreground absolute top-1/2 right-1 -translate-y-1/2 rounded-full'
				/>
			)}
		</div>

		<ActionButton size='lg' className='w-full' icon={<Icons.plus />} onClick={onShowNewForm} text='Nuevo' />
	</div>
)
