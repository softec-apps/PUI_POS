'use client'

import { z } from 'zod'
import React, { useEffect } from 'react'
import { Icons } from '@/components/icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, FormProvider } from 'react-hook-form'
import { I_Product } from '@/modules/product/types/product'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { FormFooter } from '@/modules/product/components/organisms/Modal/FormFooter'
import { useProduct } from '@/common/hooks/useProduct'
import { useCategory } from '@/common/hooks/useCategory'
import { useBrand } from '@/common/hooks/useBrand'
import { useSupplier } from '@/common/hooks/useSupplier'
import { useTemplate } from '@/common/hooks/useTemplate'
import { useFileUpload } from '@/common/hooks/useFileUpload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'
import { SelectFieldZod } from '@/components/layout/atoms/SelectFieldZod'
import { CategorySelector } from './CategorySelector'
import { BrandSelector } from './BrandSelector'
import { SupplierSelector } from './SupplierSelector'
import { TemplateSelector } from './TemplateSelector'
import { FileUploadSection } from './FileUpload'

const productSchema = z.object({
  name: z.string().nonempty('El nombre es requerido'),
  description: z.string().optional().or(z.literal('')),
  price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Debe ser un número' }).positive('Debe ser un número positivo').max(999999, 'Máximo 6 dígitos').optional()
  ),
  sku: z.string().max(20, 'Máximo 20 caracteres').optional(),
  barCode: z.string().max(50, 'Máximo 50 caracteres').optional(),
  stock: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number({ invalid_type_error: 'Debe ser un número' }).int('Debe ser un entero').min(0, 'Debe ser un número positivo').optional()
  ),
  status: z.enum(['draft', 'active', 'inactive', 'discontinued', 'out_of_stock']),
  categoryId: z.any().optional(),
  brandId: z.any().optional(),
  supplierId: z.any().optional(),
  photo: z.any().optional(),
  removePhoto: z.boolean().optional(),
  templateId: z.any().refine(value => value && value.id, {
    message: 'El ID del template es obligatorio',
  }),
});

export type ProductFormData = z.infer<typeof productSchema>

interface Props {
  isOpen: boolean
  currentRecord: I_Product | null
  onClose: () => void
  onSubmit: (data: ProductFormData) => Promise<void>
}

export function RecordFormModal({ isOpen, currentRecord, onClose, onSubmit }: Props) {
  const { getProductById } = useProduct({ enabled: false })
  const { categories } = useCategory()
  const { brands } = useBrand()
  const { suppliers } = useSupplier()
  const { templates } = useTemplate()
  const {
    previewImage,
    isUploading,
    fileInputRef,
    handleFileChange,
    clearPreview,
    triggerFileInput,
    setPreviewImage,
  } = useFileUpload()

  const methods = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      sku: '',
      barCode: '',
      stock: 0,
      status: 'draft',
      categoryId: '',
      brandId: '',
      supplierId: '',
      photo: '',
      removePhoto: false,
    },
  })

  const { handleSubmit, reset, control, formState, setValue, watch } = methods
  const { errors, isSubmitting, isValid, isDirty } = formState

  useEffect(() => {
    const fetchProduct = async () => {
      if (currentRecord?.id) {
        const response = await getProductById(currentRecord.id);
        if (response) {
          const productData = response.data
          reset({
            name: productData.name,
            description: productData.description || '',
            price: productData.price,
            sku: productData.sku || '',
            barCode: productData.barCode || '',
            stock: productData.stock,
            status: productData.status,
            categoryId: productData.category,
            brandId: productData.brand,
            supplierId: productData.supplier,
            templateId: productData.template,
            photo: productData.photo?.id || '',
            removePhoto: false,
          });
          if (productData.photo) {
            setPreviewImage(productData.photo.path);
          }
        }
      } else {
        reset({
          name: '',
          description: '',
          price: 0,
          sku: '',
          barCode: '',
          stock: 0,
          status: 'draft',
          categoryId: '',
          brandId: '',
          supplierId: '',
          templateId: '',
          photo: '',
          removePhoto: false,
        });
        setPreviewImage(null);
      }
    };

    if (isOpen) {
      fetchProduct();
    }
  }, [isOpen, currentRecord, reset, getProductById, categories, brands, suppliers, templates, setPreviewImage]);

  const handleFormSubmit = async (data: ProductFormData) => {
    
    try {
      const dataToSend = {
        ...data,
        categoryId: data.categoryId?.id,
        brandId: data.brandId?.id,
        supplierId: data.supplierId?.id,
        templateId: data.templateId?.id,
        photo: data.photo ? { id: data.photo } : undefined,
        description: data.description || null,
      };
      delete dataToSend.removePhoto;
   
      await onSubmit(dataToSend)
      handleClose()
    } catch (error) {
      console.error('Error al enviar formulario:', error)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
    clearPreview()
  }

  const handleFileChangeWithForm = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileId = await handleFileChange(e)
    if (fileId) {
      setValue('photo', fileId, { shouldDirty: true })
      setValue('removePhoto', false, { shouldDirty: true })
    }
  }

  const handleClearPreviewWithForm = () => {
    setValue('photo', '', { shouldDirty: true })
    setValue('removePhoto', true, { shouldDirty: true })
    clearPreview()
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent className='flex max-h-screen min-w-xl flex-col'>
        <SheetHeader className='bg-background supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 border-b supports-[backdrop-filter]:backdrop-blur-sm'>
          <div className='flex items-center justify-between'>
            <SheetTitle>{currentRecord ? 'Editar producto' : 'Crear producto'}</SheetTitle>
            <SheetClose>
              <ActionButton
                type='button'
                variant='ghost'
                onClick={handleClose}
                size='icon'
                disabled={isSubmitting}
                icon={<Icons.x className='h-4 w-4' />}
              />
            </SheetClose>
          </div>
          <SheetDescription>
            {currentRecord ? 'Modifica los campos del producto existente' : 'Completa los campos para crear un nuevo producto'}
          </SheetDescription>
        </SheetHeader>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className='flex-1 space-y-6 overflow-auto p-4'>
            <Card className='border-none bg-transparent p-0 shadow-none'>
              <CardHeader className='p-0'>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Icons.infoCircle className='h-4 w-4' />
                  Información básica
                </CardTitle>
                <CardDescription>Datos básicos del producto</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4 p-0'>
                <UniversalFormField control={control} name='name' label='Nombre' placeholder='Ej. Camiseta de algodón' type='text' required />
                <UniversalFormField control={control} name='description' label='Descripción' placeholder='Ej. Camiseta de algodón peinado, suave al tacto...' required={false}  />
                <UniversalFormField control={control} name='price' label='Precio' placeholder='Ej. 25.99' type='number' required />
                <UniversalFormField control={control} name='sku' label='SKU' placeholder='Ej. CAM-ALG-001' type='text' />
                <UniversalFormField control={control} name='barCode' label='Código de barras' placeholder='Ej. 7861234567890' type='text' />
                <UniversalFormField control={control} name='stock' label='Stock' placeholder='Ej. 100' type='number' required />
                <SelectFieldZod
                  control={control}
                  name='status'
                  label='Estado'
                  options={[
                    { value: 'draft', label: 'Borrador' },
                    { value: 'active', label: 'Activo' },
                    { value: 'inactive', label: 'Inactivo' },
                    { value: 'discontinued', label: 'Descontinuado' },
                    { value: 'out_of_stock', label: 'Agotado' },
                  ]}
                  required
                  value={watch('status')}
                  onChange={(value) => {
                    setValue('status', value, { shouldDirty: true })
                  }}
                />
                <CategorySelector
                  control={control}
                  setValue={methods.setValue}
                  value={watch('categoryId')}
                  categories={categories?.data.items}
                  loadingCategories={categories?.loading}
                />
                <BrandSelector
                  control={control}
                  setValue={methods.setValue}
                  value={watch('brandId')}
                  brands={brands?.data.items}
                  loadingBrands={brands?.loading}
                />
                <TemplateSelector
                  control={control}
                  setValue={methods.setValue}
                  value={watch('templateId')}
                  templates={templates?.data.items}
                />
                <FileUploadSection
                  fileInputRef={fileInputRef}
                  previewImage={previewImage}
                  isUploading={isUploading}
                  onFileChange={handleFileChangeWithForm}
                  onTriggerFileInput={triggerFileInput}
                  onClearPreview={handleClearPreviewWithForm}
                  currentImage={currentRecord?.photo}
                  shouldHideCurrentImage={watch('removePhoto')}
                />
                <SupplierSelector
                  control={control}
                  setValue={methods.setValue}
                  value={watch('supplierId')}
                  suppliers={suppliers?.data.items}
                  loadingSuppliers={suppliers?.loading}
                />
              </CardContent>
            </Card>
          </form>
        </FormProvider>
        <FormFooter
          formState={formState}
          errors={errors}
          isValid={isValid}
          isDirty={isDirty}
          currentRecord={currentRecord}
          onClose={handleClose}
          onSubmit={handleSubmit(handleFormSubmit)}
        />
      </SheetContent>
    </Sheet>
  )
}
