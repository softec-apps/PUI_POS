'use client'

import { useViewStore } from '@/common/stores/usePreferencesStore'

import { PosView } from '@/modules/pos/pos/components/view/PosView'
import { MatrizView } from '@/modules/pos/matriz/components/view/MatrizView'

export function PosViewSelector() {
	const { currentView } = useViewStore()

	return <div className='h-full'>{currentView === 'pos' ? <PosView /> : <MatrizView />}</div>
}
