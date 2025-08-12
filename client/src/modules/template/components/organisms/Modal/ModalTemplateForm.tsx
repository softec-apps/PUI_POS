'use client'

import { useEffect } from 'react'
import { Form } from '@/components/ui/form'
import { useTemplateForm } from '@/modules/template/hooks/useTemplateForm'
import { FormFooter } from '@/modules/template/components/organisms/Form/FormFooter'
import { TemplateFormProps, TemplateFormData } from '@/modules/template/types/template-form'
import { BasicInfoSection } from '@/modules/template/components/organisms/Form/BasicInfoSection'
import { CategorySelector } from '@/modules/template/components/organisms/Form/CategorySelector'
import { AttributeSelector } from '@/modules/template/components/organisms/Form/AttributeSelector'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { Icons } from '@/components/icons'

export function TemplateFormModal({ isOpen, currentTemplate, onClose, onSubmit }: TemplateFormProps) {
	const {
		form,
		categories,
		loadingCategories,
		attributes,
		loadingAttributes,
		categorySearch,
		setCategorySearch,
		attributeSearch,
		setAttributeSearch,
		categoryOpen,
		setCategoryOpen,
		attributeOpen,
		setAttributeOpen,
		selectedAttributes,
		handleAddAttribute,
		loadMoreCategories,
		resetForm,
	} = useTemplateForm(currentTemplate)

	useEffect(() => {
		if (isOpen) {
			form.reset({
				name: currentTemplate?.name || '',
				description: currentTemplate?.description || '',
				categoryId: currentTemplate?.category?.id || '',
				atributeIds: currentTemplate?.atributes?.map(a => a.id) || [],
			})
		}
	}, [isOpen, currentTemplate, form])

	const handleFormSubmit = async (data: TemplateFormData) => {
		try {
			await onSubmit(data)
			handleClose()
		} catch (error) {
			console.error('Error al enviar formulario:', error)
		}
	}

	const handleClose = () => {
		resetForm()
		onClose()
	}

	const isFormValid = form.formState.isValid && !form.formState.isSubmitting

	return (
		<Sheet open={isOpen} onOpenChange={handleClose}>
			<SheetContent className='z-50 flex max-h-screen min-w-xl flex-col [&>button]:hidden'>
				<SheetHeader className='bg-background supports-[backdrop-filter]:bg-background/80 sticky top-0 z-10 border-b supports-[backdrop-filter]:backdrop-blur-sm'>
					<div className='flex items-center justify-between'>
						<SheetTitle>{currentTemplate?.id ? 'Editar Plantilla' : 'Nueva Plantilla'}</SheetTitle>
						<SheetClose>
							<ActionButton
								type='button'
								variant='ghost'
								onClick={onClose}
								size='icon'
								disabled={onsubmit}
								icon={<Icons.x className='h-4 w-4' />}
							/>
						</SheetClose>
					</div>

					<SheetDescription>
						{currentTemplate?.id
							? 'Modifica los detalles de tu plantilla existente'
							: 'Crea una nueva plantilla personalizada para tus necesidades'}
					</SheetDescription>
				</SheetHeader>

				{/* Content */}
				<div className='flex-1 space-y-4 overflow-auto p-4'>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(handleFormSubmit)}>
							<div className='space-y-12'>
								<BasicInfoSection control={form.control} />

								<CategorySelector
									control={form.control}
									setValue={form.setValue}
									watch={form.watch}
									categories={categories}
									loadingCategories={loadingCategories}
									categorySearch={categorySearch}
									setCategorySearch={setCategorySearch}
									categoryOpen={categoryOpen}
									setCategoryOpen={setCategoryOpen}
									loadMoreCategories={loadMoreCategories}
								/>

								<AttributeSelector
									control={form.control}
									setValue={form.setValue}
									watch={form.watch}
									attributes={attributes}
									loadingAttributes={loadingAttributes}
									attributeSearch={attributeSearch}
									setAttributeSearch={setAttributeSearch}
									attributeOpen={attributeOpen}
									setAttributeOpen={setAttributeOpen}
									selectedAttributes={selectedAttributes}
									handleAddAttribute={handleAddAttribute}
								/>
							</div>
						</form>
					</Form>
				</div>

				{/* Footer */}
				<FormFooter
					formState={form.formState}
					isFormValid={isFormValid}
					currentTemplate={currentTemplate}
					onClose={handleClose}
					onSubmit={form.handleSubmit(handleFormSubmit)}
				/>
			</SheetContent>
		</Sheet>
	)
}
