'use client'

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { I_ReportItem } from '@/common/types/modules/report'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
    data: I_ReportItem[]
}

export function ReportChart({ data }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Ventas por Día</CardTitle>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={data}>
                        <XAxis
                            dataKey="date"
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#888888"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Bar dataKey="totalSales" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
