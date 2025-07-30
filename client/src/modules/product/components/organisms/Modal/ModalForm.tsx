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
import { useProductModal } from '@/modules/product/hooks/useProductModal'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'
import { SelectFieldZod } from '@/components/layout/atoms/SelectFieldZod'
import { TextareaFieldZod } from '@/components/layout/atoms/TextareaFieldZod'
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
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  supplierId: z.string().optional(),
  photo: z.any().optional(),
  removePhoto: z.boolean().optional(),
  templateId: z.string().nonempty('El ID del template es obligatorio'),
});

export type ProductFormData = z.infer<typeof productSchema>

interface Props {
  isOpen: boolean
  currentRecord: I_Product | null
  onClose: () => void
  onSubmit: (data: ProductFormData) => Promise<void>
}

export function RecordFormModal({ isOpen, currentRecord, onClose, onSubmit }: Props) {
  const {
    categoriesData,
    loadingCategories,
    categorySearch,
    setCategorySearch,
    categoryOpen,
    setCategoryOpen,
    loadMoreCategories,
    brandsData,
    loadingBrands,
    brandSearch,
    setBrandSearch,
    brandOpen,
    setBrandOpen,
    loadMoreBrands,
    suppliersData,
    loadingSuppliers,
    supplierSearch,
    setSupplierSearch,
    supplierOpen,
    setSupplierOpen,
    loadMoreSuppliers,
    templatesData,
    loadingTemplates,
    templateSearch,
    setTemplateSearch,
    templateOpen,
    setTemplateOpen,
    loadMoreTemplates,
    fileInputRef,
    previewImage,
    isUploading,
    handleFileChange,
    triggerFileInput,
    clearPreview,
    setPreviewImage,
  } = useProductModal(currentRecord)

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
    if (isOpen) {
      if (currentRecord) {
        reset({
          name: currentRecord.name,
          description: currentRecord.description || '',
          price: currentRecord.price,
          sku: currentRecord.sku || '',
          barCode: currentRecord.barCode || '',
          stock: currentRecord.stock,
          status: currentRecord.status,
          categoryId: currentRecord.category?.id || '',
          brandId: currentRecord.brand?.id || '',
          supplierId: currentRecord.supplier?.id || '',
          templateId: currentRecord.template?.id || '',
          photo: currentRecord.photo?.id || '',
          removePhoto: false,
        });

        if (currentRecord.photo) {
          setPreviewImage(currentRecord.photo.path)
        } else {
          setPreviewImage(null)
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
        clearPreview()
      }
    }
  }, [isOpen, currentRecord, reset, setPreviewImage, clearPreview]);

  const handleFormSubmit = async (data: ProductFormData) => {
    
    try {
      const dataToSend = {
        ...data,
        photo: data.photo ? { id: data.photo } : undefined,
        description: data.description || null,
      };
      delete dataToSend.removePhoto;
      if (!dataToSend.templateId) {
        delete dataToSend.templateId;
      }
   
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

  const removePhoto = watch('removePhoto')

  const handleClearPreviewWithForm = () => {
    const currentPhoto = currentRecord?.photo?.id

    if (currentPhoto) {
      setValue('removePhoto', true, { shouldDirty: true })
      setValue('photo', '', { shouldDirty: true })
    } else {
      setValue('photo', '', { shouldDirty: true })
      setValue('removePhoto', false, { shouldDirty: true })
    }

    clearPreview()
  }

  const handleFileChangeWithForm = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileId = await handleFileChange(e)
    if (fileId) {
      setValue('photo', fileId, { shouldDirty: true })
      setValue('removePhoto', false, { shouldDirty: true })
    }
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
                <TextareaFieldZod control={control} name='description' label='Descripción' placeholder='Ej. Camiseta de algodón peinado, suave al tacto...' required={false}/>
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
                  categories={categoriesData}
                  loadingCategories={loadingCategories}
                  categorySearch={categorySearch}
                  setCategorySearch={setCategorySearch}
                  categoryOpen={categoryOpen}
                  setCategoryOpen={setCategoryOpen}
                  loadMoreCategories={loadMoreCategories}
                />
                <BrandSelector
                  control={control}
                  setValue={methods.setValue}
                  brands={brandsData}
                  loadingBrands={loadingBrands}
                  brandSearch={brandSearch}
                  setBrandSearch={setBrandSearch}
                  brandOpen={brandOpen}
                  setBrandOpen={setBrandOpen}
                  loadMoreBrands={loadMoreBrands}
                />
                <SupplierSelector
                  control={control}
                  setValue={methods.setValue}
                  suppliers={suppliersData}
                  loadingSuppliers={loadingSuppliers}
                  supplierSearch={supplierSearch}
                  setSupplierSearch={setSupplierSearch}
                  supplierOpen={supplierOpen}
                  setSupplierOpen={setSupplierOpen}
                  loadMoreSuppliers={loadMoreSuppliers}
                  value={watch('supplierId')}
                />
                <TemplateSelector
                  control={control}
                  setValue={methods.setValue}
                  templates={templatesData}
                  loadingTemplates={loadingTemplates}
                  templateSearch={templateSearch}
                  setTemplateSearch={setTemplateSearch}
                  templateOpen={templateOpen}
                  setTemplateOpen={setTemplateOpen}
                  loadMoreTemplates={loadMoreTemplates}
                  value={watch('templateId')}
                />
                <FileUploadSection
                  fileInputRef={fileInputRef}
                  previewImage={previewImage}
                  isUploading={isUploading}
                  onFileChange={handleFileChangeWithForm}
                  onTriggerFileInput={triggerFileInput}
                  onClearPreview={handleClearPreviewWithForm}
                  currentImage={currentRecord?.photo}
                  shouldHideCurrentImage={removePhoto}
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
