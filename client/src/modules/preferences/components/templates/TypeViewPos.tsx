'use client'

import React from 'react'
import { Typography } from '@/components/ui/typography'
import { Card, CardContent } from '@/components/ui/card'
import { useViewStore } from '@/common/stores/usePreferencesStore'
import { CardHeaderInfo } from '@/modules/preferences/components/atoms/CardHeaderInfo'
import { Badge } from '@/components/layout/atoms/Badge'
import { SoomFeatureBadge } from '@/components/layout/organims/SoomFeat'

export const TypeView: React.FC = () => {
	const { currentView, setView } = useViewStore()

	return (
		<>
			<Card className='border-none bg-transparent p-0 shadow-none'>
				<CardHeaderInfo
					title='Tipo de vista'
					description='Selecciona entre la vista simple, pensada para ventas rápidas y sin distracciones, o la vista avanzada, que ofrece herramientas adicionales y mayor control en el punto de venta.'
				/>

				{/* Card de Selección de Vista */}
				<Card className='border-none bg-transparent p-0 shadow-none'>
					<CardContent className='p-0'>
						<div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
							{/* View simple */}
							<div
								className={`border-border/50 relative cursor-pointer space-y-6 rounded-2xl border p-4 transition-all duration-500 ${
									currentView === 'matriz' ? 'border-primary' : ''
								}`}
								onClick={() => setView('matriz')}>
								<CardHeaderInfo
									title='Vista simple'
									description='Una interfaz directa y optimizada para uso inmediato en el punto de venta. Pensada para trabajar de forma ágil y sin distracciones, pero con la posibilidad de acceder a funciones avanzadas cuando lo necesites.'
								/>

								<div className='bg-background space-y-4 rounded-lg border p-3'>
									<div className='grid grid-cols-[1fr_auto] gap-4'>
										{/* Columna izquierda  */}
										<div className='flex flex-col gap-2'>
											<div className='space-y-2'>
												<div className='bg-accent-foreground/20 dark:bg-accent h-6 w-full rounded'></div>

												<div className='grid grid-cols-6 gap-2'>
													{Array.from({ length: 18 }).map((_, index) => (
														<div key={index} className='dark:bg-accent/40 bg-muted-foreground/15 h-14 rounded'></div>
													))}
												</div>
											</div>
										</div>

										{/* Columna derecha */}
										<div className='flex flex-col justify-between'>
											<div className='space-y-2'>
												<div className='flex flex-col gap-2'>
													{Array.from({ length: 2 }).map((_, index) => (
														<div
															key={index}
															className='dark:bg-accent/40 bg-muted-foreground/15 h-8 w-36 rounded'></div>
													))}
												</div>
											</div>

											{/* Esto va al final */}
											<div className='bg-accent-foreground/40 h-8 w-full rounded'></div>
										</div>
									</div>
								</div>
							</div>

							{/* View advance - próximamente */}
							<div
								className={`border-border/50 relative cursor-not-allowed space-y-6 rounded-2xl border-2 p-4 opacity-80`}>
								<CardHeaderInfo
									title='Vista avanzada'
									description='Esta vista ofrecerá una experiencia completa en el punto de venta con herramientas de análisis, controles adicionales y mayor personalización. Próximamente disponible.'
								/>

								<SoomFeatureBadge />

								<div className='bg-background space-y-4 rounded-lg border p-3'>
									<div className='grid grid-cols-[1fr_auto] gap-4'>
										{/* Columna izquierda */}
										<div className='flex flex-col gap-2 space-y-4'>
											<div className='flex-1 space-y-2'>
												<div className='dark:bg-accent/70 bg-muted-foreground/40 h-3 w-1/6 rounded'></div>
												<div className='grid grid-cols-6 gap-2'>
													{Array.from({ length: 4 }).map((_, index) => (
														<div key={index} className='dark:bg-accent/40 bg-muted-foreground/15 h-6 rounded'></div>
													))}
												</div>
											</div>

											<div className='space-y-2'>
												<div className='dark:bg-accent/70 bg-muted-foreground/40 h-3 w-1/5 rounded'></div>

												<div className='flex items-center justify-between gap-4'>
													<div className='flex items-center gap-2'>
														<div className='dark:bg-accent/70 bg-muted-foreground/40 h-4 w-5 rounded'></div>
														<div className='dark:bg-accent/70 bg-muted-foreground/40 h-4 w-4 rounded-full'></div>
														<div className='dark:bg-accent/70 bg-muted-foreground/40 h-4 w-5 rounded'></div>
													</div>

													<div className='flex items-center gap-2'>
														<div className='dark:bg-accent/70 bg-muted-foreground/40 h-4 w-20 rounded'></div>
													</div>
												</div>

												<div className='grid grid-cols-4 gap-2'>
													{Array.from({ length: 8 }).map((_, index) => (
														<div key={index} className='dark:bg-accent/40 bg-muted-foreground/15 h-16 rounded'></div>
													))}
												</div>
											</div>
										</div>

										{/* Columna derecha */}
										<div className='flex flex-col justify-between border-l pl-4'>
											<div className='space-y-2'>
												<div className='dark:bg-accent/70 bg-muted-foreground/40 h-3 w-1/3 rounded'></div>

												<div className='flex flex-col gap-2'>
													{Array.from({ length: 2 }).map((_, index) => (
														<div
															key={index}
															className='dark:bg-accent/40 bg-muted-foreground/15 h-8 w-36 rounded'></div>
													))}
												</div>
											</div>

											{/* Esto va al final */}
											<div className='bg-accent-foreground/40 h-8 w-full rounded'></div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</Card>
		</>
	)
}
