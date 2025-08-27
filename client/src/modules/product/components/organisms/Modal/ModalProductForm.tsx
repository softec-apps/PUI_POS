'use client'

import { useEffect, useState } from 'react'
import { Form } from '@/components/ui/form'

import { useProduct } from '@/common/hooks/useProduct'
import { useProductForm } from '@/modules/product/hooks/useProductForm'

import { ProductFormProps, ProductFormData } from '@/modules/product/types/product-form'

import { Icons } from '@/components/icons'
import { FormFooter } from '@/modules/product/components/organisms/Form/FormFooter'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'

import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { MediaSection } from '@/modules/product/components/organisms/Form/MediaSection'
import { BrandSelector } from '@/modules/product/components/organisms/Form/BrandSelector'
import { EconomicSection } from '@/modules/product/components/organisms/Form/EconomicSection'
import { SupplierSelector } from '@/modules/product/components/organisms/Form/SupplierSelector'
import { CategorySelector } from '@/modules/product/components/organisms/Form/CategorySelector'
import { BasicInfoSection } from '@/modules/product/components/organisms/Form/BasicInfoSection'
import { TemplateSelector } from '@/modules/product/components/organisms/Form/TemplateSelector'
import { StatusSection } from '../Form/StatusSection'
import { TaxAllow } from '@/modules/product/constants/product.constants'

export function ProductFormModal({ isOpen, currentRecord, onClose, onSubmit }: ProductFormProps) {
	console.log(currentRecord)
	const { getProductById } = useProduct()
	const [productData, setProductData] = useState(null)
	const [loadingProduct, setLoadingProduct] = useState(false)

	const {
		form,
		resetForm,
		// categories
		categoriesData,
		categorySearch,
		loadingCategories,
		setCategorySearch,
		categoryOpen,
		setCategoryOpen,
		// brands
		brandsData,
		brandSearch,
		loadingBrands,
		setBrandSearch,
		brandOpen,
		setBrandOpen,
		// suppliers
		suppliersData,
		supplierSearch,
		loadingSuppliers,
		setSupplierSearch,
		supplierOpen,
		setSupplierOpen,
		// templates
		templatesData,
		templateSearch,
		loadingTemplates,
		setTemplateSearch,
		templateOpen,
		setTemplateOpen,
	} = useProductForm(productData)

	// Helper function to format tax value properly
	const formatTaxValue = (taxValue: any): TaxAllow => {
		if (taxValue === null || taxValue === undefined || taxValue === '') {
			return TaxAllow.EXENTO // Default to exempt if no value
		}

		// Convert number to TaxAllow enum
		const numericValue = Number(taxValue)
		if (numericValue === 15) {
			return TaxAllow.CON_IVA
		} else if (numericValue === 0) {
			return TaxAllow.EXENTO
		}

		// If it's already a valid enum value, return it
		if (Object.values(TaxAllow).includes(taxValue)) {
			return taxValue
		}

		// Default fallback
		return TaxAllow.EXENTO
	}

	// Fetch complete product data when modal opens with an existing product
	useEffect(() => {
		const fetchProductData = async () => {
			if (isOpen && currentRecord?.id) {
				setLoadingProduct(true)
				try {
					const completeProduct = await getProductById(currentRecord.id)
					setProductData(completeProduct)
				} catch (error) {
					console.error('Error al obtener datos completos del producto:', error)
					// Fallback to currentRecord if fetch fails
					setProductData(currentRecord)
				} finally {
					setLoadingProduct(false)
				}
			} else if (isOpen && !currentRecord?.id) {
				// New product - no need to fetch
				setProductData(null)
				setLoadingProduct(false)
			}
		}

		fetchProductData()
	}, [isOpen, currentRecord?.id, getProductById])

	// Reset form with complete product data
	useEffect(() => {
		if (isOpen && !loadingProduct) {
			const dataToUse = productData || currentRecord

			form.reset({
				name: dataToUse?.name || '',
				description: dataToUse?.description || '',
				status: dataToUse?.status || '',
				photo: dataToUse?.photo || '',
				removePhoto: false,
				price: dataToUse?.price || '',
				sku: dataToUse?.sku || '',
				barCode: dataToUse?.barCode || '',
				stock: dataToUse?.stock || '',
				tax: formatTaxValue(dataToUse?.tax), // Format tax value properly
				categoryId: dataToUse?.category?.id || '',
				brandId: dataToUse?.brand?.id || '', // Make optional - empty string when null
				supplierId: dataToUse?.supplier?.id || '',
				templateId: dataToUse?.template?.id || '', // Make optional - empty string when null
			})
		}
	}, [isOpen, loadingProduct, productData, currentRecord, form])

	const handleFormSubmit = async (data: ProductFormData) => {
		try {
			await onSubmit(data)
			handleClose()
		} catch (error) {
			console.error('Error al enviar formulario:', error)
		}
	}

	const handleClose = () => {
		resetForm()
		setProductData(null)
		onClose()
	}

	const isFormValid = form.formState.isValid && !form.formState.isSubmitting

	return (
		<Sheet open={isOpen} onOpenChange={handleClose}>
			<SheetContent className='z-50 flex max-h-screen min-w-full flex-col [&>button]:hidden'>
				<SheetHeader className='bg-background supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 border-b supports-[backdrop-filter]:backdrop-blur-sm'>
					<div className='flex items-center justify-between'>
						<SheetTitle>{currentRecord?.id ? 'Editar producto' : 'Nuevo producto'}</SheetTitle>
						<SheetClose>
							<ActionButton
								type='button'
								variant='ghost'
								onClick={onClose}
								size='icon'
								disabled={form.formState.isSubmitting}
								icon={<Icons.x className='h-4 w-4' />}
							/>
						</SheetClose>
					</div>

					<SheetDescription>
						{currentRecord?.id ? 'Actualiza los detalles de este producto' : 'Agrega un nuevo producto'}
					</SheetDescription>
				</SheetHeader>

				{/* Content */}
				<div className='flex-1 space-y-4 overflow-auto p-4'>
					{loadingProduct ? (
						<div className='flex h-screen flex-1 flex-col items-center justify-center'>
							<SpinnerLoader text='Cargando... Por favor espera' />
						</div>
					) : (
						<Form {...form}>
							<form onSubmit={form.handleSubmit(handleFormSubmit)}>
								<div className='space-y-8'>
									{/* First Row - Basic Info + Economic */}
									<div className='grid grid-cols-1 gap-12 md:grid-cols-2'>
										<BasicInfoSection control={form.control} />
										<EconomicSection control={form.control} />
									</div>

									{/* Third Row - Brand + Supplier */}
									<div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
										<div className='grid grid-cols-2 gap-8'>
											<CategorySelector
												control={form.control}
												setValue={form.setValue}
												watch={form.watch}
												categories={categoriesData}
												loadingCategories={loadingCategories}
												categorySearch={categorySearch}
												setCategorySearch={setCategorySearch}
												categoryOpen={categoryOpen}
												setCategoryOpen={setCategoryOpen}
											/>

											<SupplierSelector
												control={form.control}
												setValue={form.setValue}
												watch={form.watch}
												suppliers={suppliersData}
												loadingSupplier={loadingSuppliers}
												supplierSearch={supplierSearch}
												setSupplierSearch={setSupplierSearch}
												supplierOpen={supplierOpen}
												setSupplierOpen={setSupplierOpen}
											/>
										</div>

										<div className='grid grid-cols-2 gap-8'>
											<BrandSelector
												control={form.control}
												setValue={form.setValue}
												watch={form.watch}
												brands={brandsData}
												loadingBrand={loadingBrands}
												brandSearch={brandSearch}
												setBrandSearch={setBrandSearch}
												brandOpen={brandOpen}
												setBrandOpen={setBrandOpen}
											/>

											<TemplateSelector
												control={form.control}
												setValue={form.setValue}
												watch={form.watch}
												templates={templatesData}
												loadingTemplates={loadingTemplates}
												templateSearch={templateSearch}
												setTemplateSearch={setTemplateSearch}
												templateOpen={templateOpen}
												setTemplateOpen={setTemplateOpen}
											/>
										</div>

										<MediaSection control={form.control} setValue={form.setValue} watch={form.watch} />

										<StatusSection control={form.control} />
									</div>
								</div>
							</form>
						</Form>
					)}
				</div>

				{/* Footer */}
				{!loadingProduct && (
					<FormFooter
						formState={form.formState}
						isFormValid={isFormValid}
						currentRecord={productData || currentRecord}
						onClose={handleClose}
						onSubmit={form.handleSubmit(handleFormSubmit)}
					/>
				)}
			</SheetContent>
		</Sheet>
	)
}
