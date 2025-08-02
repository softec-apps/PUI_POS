import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type ViewType = 'pos' | 'matriz'

export interface SystemPreferences {
	ivaRate: number
	currency: string
	showStock: boolean
	requireCustomer: boolean
}

export interface PreferencesState {
	// Vista actual
	currentView: ViewType

	// Preferencias del sistema
	preferences: SystemPreferences

	// Acciones para cambiar vista
	setView: (view: ViewType) => void
	toggleView: () => void

	// Acciones para preferencias
	updatePreferences: (preferences: Partial<SystemPreferences>) => void
	updateIvaRate: (rate: number) => void
	updateCurrency: (currency: string) => void
	toggleShowStock: () => void
	toggleRequireCustomer: () => void
	resetPreferences: () => void
}

const defaultPreferences: SystemPreferences = {
	ivaRate: 12,
	currency: 'USD',
	showStock: true,
	requireCustomer: false,
}

export const usePreferencesStore = create<PreferencesState>()(
	persist(
		(set, get) => ({
			currentView: 'pos',
			preferences: defaultPreferences,

			setView: (view: ViewType) => set({ currentView: view }),

			toggleView: () =>
				set(state => ({
					currentView: state.currentView === 'pos' ? 'matriz' : 'pos',
				})),

			updatePreferences: (newPreferences: Partial<SystemPreferences>) =>
				set(state => ({
					preferences: { ...state.preferences, ...newPreferences },
				})),

			updateIvaRate: (rate: number) =>
				set(state => ({
					preferences: { ...state.preferences, ivaRate: rate },
				})),

			updateCurrency: (currency: string) =>
				set(state => ({
					preferences: { ...state.preferences, currency },
				})),

			toggleShowStock: () =>
				set(state => ({
					preferences: {
						...state.preferences,
						showStock: !state.preferences.showStock,
					},
				})),

			toggleRequireCustomer: () =>
				set(state => ({
					preferences: {
						...state.preferences,
						requireCustomer: !state.preferences.requireCustomer,
					},
				})),

			resetPreferences: () => set({ preferences: defaultPreferences }),
		}),
		{
			name: 'preferences-storage',
			storage: createJSONStorage(() => localStorage),
			partialize: state => ({
				currentView: state.currentView,
				preferences: state.preferences,
			}),
		}
	)
)

// Hook personalizado para solo la vista
export const useViewStore = () => {
	const currentView = usePreferencesStore(state => state.currentView)
	const setView = usePreferencesStore(state => state.setView)
	const toggleView = usePreferencesStore(state => state.toggleView)

	return { currentView, setView, toggleView }
}

// Hook personalizado para solo las preferencias
export const useSystemPreferences = () => {
	const preferences = usePreferencesStore(state => state.preferences)
	const updatePreferences = usePreferencesStore(state => state.updatePreferences)
	const updateIvaRate = usePreferencesStore(state => state.updateIvaRate)
	const updateCurrency = usePreferencesStore(state => state.updateCurrency)
	const toggleShowStock = usePreferencesStore(state => state.toggleShowStock)
	const toggleRequireCustomer = usePreferencesStore(state => state.toggleRequireCustomer)
	const resetPreferences = usePreferencesStore(state => state.resetPreferences)

	return {
		preferences,
		updatePreferences,
		updateIvaRate,
		updateCurrency,
		toggleShowStock,
		toggleRequireCustomer,
		resetPreferences,
	}
}
