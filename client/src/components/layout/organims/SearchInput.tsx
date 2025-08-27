'use client'

import React, { useState } from 'react'
import { Icons } from '@/components/icons'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchInputProps {
	value: string
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = 'Buscar registros...' }: SearchInputProps) {
	const [isFocused, setIsFocused] = useState(false)

	const clearSearch = () => onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)

	return (
		<div
			className={`!bg-background relative rounded-2xl transition-all duration-300 ${isFocused ? 'ring-primary/20 shadow-lg ring-2' : ''}`}>
			<div className='text-muted-foreground pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-4'>
				<Icons.search size={18} />
			</div>

			<Input
				placeholder={placeholder}
				className='text-primary !bg-background dark:!bg-popover w-full rounded-2xl pr-12 pl-12 shadow-none transition-all duration-500'
				onChange={onChange}
				value={value}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				aria-label='Buscar registros'
			/>

			<AnimatePresence>
				{value && (
					<motion.button
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						onClick={clearSearch}
						className='text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex items-center pr-2 transition-colors'
						aria-label='Limpiar búsqueda'>
						<div className='bg-accent hover:bg-accent-foreground/20 cursor-pointer rounded-full p-1 transition-colors duration-300'>
							<Icons.x className='h-4 w-4' />
						</div>
					</motion.button>
				)}
			</AnimatePresence>
		</div>
	)
}
