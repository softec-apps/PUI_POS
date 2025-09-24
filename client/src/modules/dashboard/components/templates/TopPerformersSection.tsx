'use client'

import React from 'react'
import { DashboardMetrics } from '@/modules/dashboard/types/dashboard'
import { TopProductsCard } from '@/modules/dashboard/components/organisms/TopProductsCard'
import { TopCustomersCard } from '@/modules/dashboard/components/organisms/TopCustomersCard'

interface TopPerformersSectionProps {
	metrics: DashboardMetrics
}

export const TopCustomersSection: React.FC<TopPerformersSectionProps> = ({ metrics }) => {
	return <TopCustomersCard customers={metrics?.topCustomers} />
}

export const TopProductsSection: React.FC<TopPerformersSectionProps> = ({ metrics }) => {
	return <TopProductsCard products={metrics?.topProducts} />
}
