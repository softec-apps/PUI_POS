'use client'

import React from 'react'
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface CardHeaderInfoProps {
	title: string
	description: string
}

export const CardHeaderInfo: React.FC<CardHeaderInfoProps> = ({ title, description }) => {
	return (
		<CardHeader className='flex w-full flex-col p-0'>
			<CardTitle>{title}</CardTitle>
			<CardDescription>{description}</CardDescription>
		</CardHeader>
	)
}
