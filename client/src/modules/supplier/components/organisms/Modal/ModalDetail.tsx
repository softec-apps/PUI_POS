'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useSupplier } from '@/common/hooks/useSupplier'
import { useCallback, useState, useEffect } from 'react'
import { I_Supplier } from '@/common/types/modules/supplier'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ModalDetailProps {
	isOpen: boolean
	currentRecord: I_Supplier | null
	onClose: () => void
}

export function ModalDetail({ isOpen, currentRecord, onClose }: ModalDetailProps) {
	const { getSupplierById } = useSupplier({})
	const [supplierDetails, setSupplierDetails] = useState<I_Supplier | null>(null)
	const [loadingDetails, setLoadingDetails] = useState(false)

	const loadSupplierDetails = useCallback(async () => {
		if (!currentRecord?.id) return

		setLoadingDetails(true)
		try {
			const details = await getSupplierById(currentRecord.id)
			setSupplierDetails(details)
		} catch (error) {
			console.error('Error al cargar detalles del proveedor:', error)
		} finally {
			setLoadingDetails(false)
		}
	}, [currentRecord?.id, getSupplierById])

	useEffect(() => {
		if (isOpen && currentRecord) {
			loadSupplierDetails()
		} else {
			setSupplierDetails(null)
		}
	}, [isOpen, currentRecord, loadSupplierDetails])

	const getStatusVariant = (status: string) => {
		switch (status) {
			case 'active':
				return 'success'
			case 'inactive':
				return 'secondary'
			case 'suspended':
				return 'destructive'
			default:
				return 'default'
		}
	}

	const formatDate = (date: string | Date | null) => {
		if (!date) return 'N/A'
		return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es })
	}

	return (
		<Sheet open={isOpen} onOpenChange={onClose}>
			<SheetContent className='w-full min-w-full sm:max-w-full'>
				{loadingDetails ? (
					<div className='flex h-screen flex-1 flex-col items-center justify-center'>
						<SpinnerLoader text='Cargando... Por favor espera' />
					</div>
				) : (
					<>
						<SheetHeader>
							<SheetTitle>Detalles del Proveedor</SheetTitle>
							<SheetDescription>Información completa del proveedor y sus productos</SheetDescription>
						</SheetHeader>

						<ScrollArea className='h-full px-1 py-4'>
							{supplierDetails ? (
								<div className='space-y-8'>
									{/* Header con información principal */}
									<div className='space-y-4'>
										<div className='flex items-start justify-between'>
											<div>
												<h2 className='text-2xl font-bold tracking-tight'>
													{supplierDetails.commercialName || supplierDetails.legalName}
												</h2>
												<p className='text-muted-foreground'>{supplierDetails.legalName}</p>
											</div>
											<Badge variant={getStatusVariant(supplierDetails.status)} className='px-3 py-1 text-sm'>
												{supplierDetails.status}
											</Badge>
										</div>

										<div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
											<Card className='bg-muted/40'>
												<CardHeader className='pb-2'>
													<CardTitle className='flex items-center gap-2 text-sm font-medium'>RUC</CardTitle>
												</CardHeader>
												<CardContent>
													<p className='text-lg font-semibold'>{supplierDetails.ruc}</p>
												</CardContent>
											</Card>

											<Card className='bg-muted/40'>
												<CardHeader className='pb-2'>
													<CardTitle className='flex items-center gap-2 text-sm font-medium'>
														Nombre Comercial
													</CardTitle>
												</CardHeader>
												<CardContent>
													<p className='text-lg font-semibold'>{supplierDetails.commercialName || 'No especificado'}</p>
												</CardContent>
											</Card>

											<Card className='bg-muted/40'>
												<CardHeader className='pb-2'>
													<CardTitle className='flex items-center gap-2 text-sm font-medium'>
														<Icons.mail className='h-4 w-4' />
														Contacto
													</CardTitle>
												</CardHeader>
												<CardContent>
													<p className='text-lg font-semibold'>{supplierDetails.email || 'No especificado'}</p>
												</CardContent>
											</Card>
										</div>
									</div>

									<Separator />

									{/* Información de fechas */}
									<div className='space-y-4'>
										<h3 className='flex items-center gap-2 text-lg font-semibold'>
											<Icons.calendar className='h-5 w-5' />
											Fechas
										</h3>

										<div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
											<Card>
												<CardHeader className='pb-2'>
													<CardTitle className='flex items-center gap-2 text-sm font-medium'>Creado</CardTitle>
												</CardHeader>
												<CardContent>
													<p className='font-medium'>{formatDate(supplierDetails.createdAt)}</p>
												</CardContent>
											</Card>

											<Card>
												<CardHeader className='pb-2'>
													<CardTitle className='flex items-center gap-2 text-sm font-medium'>Actualizado</CardTitle>
												</CardHeader>
												<CardContent>
													<p className='font-medium'>{formatDate(supplierDetails.updatedAt)}</p>
												</CardContent>
											</Card>

											{supplierDetails.deletedAt && (
												<Card className='border-destructive/20 bg-destructive/5'>
													<CardHeader className='pb-2'>
														<CardTitle className='text-destructive flex items-center gap-2 text-sm font-medium'>
															<Icons.calendarX className='h-4 w-4' />
															Eliminado
														</CardTitle>
													</CardHeader>
													<CardContent>
														<p className='text-destructive font-medium'>{formatDate(supplierDetails.deletedAt)}</p>
													</CardContent>
												</Card>
											)}
										</div>
									</div>

									<Separator />

									{/* Productos del proveedor */}
									<div className='space-y-4'>
										<div className='flex items-center justify-between'>
											<h3 className='flex items-center gap-2 text-lg font-semibold'>
												<Icons.package className='h-5 w-5' />
												Productos
											</h3>
											<Badge variant='outline' className='px-2 py-1'>
												{supplierDetails.product?.length || 0} productos
											</Badge>
										</div>

										{supplierDetails.product && supplierDetails.product.length > 0 ? (
											<Card>
												<CardContent className='p-0'>
													<Table>
														<TableHeader>
															<TableRow>
																<TableHead className='w-[200px]'>Producto</TableHead>
																<TableHead>Código</TableHead>
																<TableHead>Precio</TableHead>
																<TableHead>Stock</TableHead>
																<TableHead>Estado</TableHead>
																<TableHead className='text-right'>Acciones</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{supplierDetails.product.map(product => (
																<TableRow key={product.id}>
																	<TableCell className='font-medium'>{product.name}</TableCell>
																	<TableCell>{product.code}</TableCell>
																	<TableCell>${product.price}</TableCell>
																	<TableCell>{product.stock} unidades</TableCell>
																	<TableCell>
																		<Badge variant={getStatusVariant(product.status)}>{product.status}</Badge>
																	</TableCell>
																	<TableCell className='text-right'>
																		<Button variant='ghost' size='icon'>
																			<Icons.eye className='h-4 w-4' />
																		</Button>
																	</TableCell>
																</TableRow>
															))}
														</TableBody>
													</Table>
												</CardContent>
											</Card>
										) : (
											<Card>
												<CardContent className='flex flex-col items-center p-6 text-center'>
													<Icons.package className='text-muted-foreground mx-auto mb-2 h-10 w-10' />
													<p className='text-muted-foreground'>No hay productos asociados a este proveedor</p>
													<Button variant='outline' className='mt-4'>
														<Icons.plus className='mr-2 h-4 w-4' />
														Agregar Producto
													</Button>
												</CardContent>
											</Card>
										)}
									</div>
								</div>
							) : (
								<div className='flex h-full flex-col items-center justify-center space-y-4'>
									<Icons.infoCircle className='text-muted-foreground h-12 w-12' />
									<p className='text-muted-foreground text-center'>No se pudieron cargar los detalles del proveedor</p>
									<Button variant='outline' onClick={() => window.location.reload()}>
										Reintentar
									</Button>
								</div>
							)}
						</ScrollArea>
					</>
				)}
			</SheetContent>
		</Sheet>
	)
}
