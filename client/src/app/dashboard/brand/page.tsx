'use client'

import { RoleGuard } from '@/components/layout/RoleGuard'
import PageContainer from '@/components/layout/page-container'
import { BrandView } from '@/modules/brand/components/view/BrandView'

export default function BrandPage() {
    return (
        <RoleGuard requiredRole='admin'>
            <PageContainer>
                <BrandView />
            </PageContainer>
        </RoleGuard>
    )
}
