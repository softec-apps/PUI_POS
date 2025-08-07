'use client'

import { toast } from 'sonner'
import { useEffect } from 'react'
import React from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent } from '@/components/ui/card'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { useEstablishment } from '@/common/hooks/useEstablishment'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { validateEcuadorianRUC } from '@/common/utils/ecValidation-util'
import { FileUploadSection } from '@/components/layout/organims/FileUpload'
import { useFileUpload } from '@/common/hooks/useFileUpload'
import { CardHeaderInfo } from '@/modules/preferences/components/atoms/CardHeaderInfo'

const systemPreferencesSchema = z.object({
	accounting: z.enum(['SI', 'NO'], {
		required_error: 'Campo requerido',
		invalid_type_error: 'Debe seleccionar SI o NO',
	}),
	addressIssuingEstablishment: z.string().min(1, 'Campo requerido').max(300, 'Máximo 300 caracteres'),
	companyName: z.string().min(1, 'Campo requerido').max(300, 'Máximo 300 caracteres'),
	environmentType: z.enum(['1', '2'], {
		required_error: 'Campo requerido',
		invalid_type_error: 'Debe ser 1 o 2',
	}),
	resolutionNumber: z
		.number({ required_error: 'Campo requerido', invalid_type_error: 'Debe ser un número' })
		.int('Debe ser un número entero')
		.min(10000, 'Debe tener exactamente 5 dígitos')
		.max(99999, 'Debe tener exactamente 5 dígitos'),
	ruc: z
		.string()
		.min(1, 'No puede estar vacío')
		.refine(value => /^\d*$/.test(value), {
			message: 'Formato inválido',
		})
		.refine(value => value.length === 13, {
			message: 'Debe tener exactamente 13 caracteres',
		})
		.refine(
			value => {
				if (value.length === 13 && /^\d{13}$/.test(value)) {
					try {
						return validateEcuadorianRUC(value)
					} catch (error) {
						console.error('Error validating RUC:', error)
						return false
					}
				}
				return false
			},
			{ message: 'RUC ingresado no es válido' }
		),
	tradeName: z.string().min(1, 'Campo requerido').max(300, 'Máximo 300 caracteres'),
	typeIssue: z.literal(1, {
		required_error: 'El tipo de emisión debe ser 1',
		invalid_type_error: 'El tipo de emisión debe ser 1',
	}),
	issuingEstablishmentCode: z
		.number({ required_error: 'Campo requerido', invalid_type_error: 'Debe ser un número' })
		.int('Debe ser un número entero')
		.min(1, 'Debe tener al menos 1 dígito')
		.max(999, 'Debe tener máximo 3 dígitos'),
	issuingPointCode: z
		.number({ required_error: 'Campo requerido', invalid_type_error: 'Debe ser un número' })
		.int('Debe ser un número entero')
		.min(1, 'Debe tener al menos 1 dígito')
		.max(999, 'Debe tener máximo 3 dígitos'),
	parentEstablishmentAddress: z.string().max(300, 'Máximo 300 caracteres').optional(),
	photo: z.string().optional(), // File ID, not a URL
})

type SystemPreferencesFormData = z.infer<typeof systemPreferencesSchema>

export function SystemPreferences() {
	const { recordsData, loading, error, updateRecord, isUpdating, createRecord } = useEstablishment()
	const { previewImage, isUploading, fileInputRef, uploadFile, clearPreview, triggerFileInput, setPreviewImage } =
		useFileUpload({ showPreview: true })

	const formMethods = useForm<SystemPreferencesFormData>({
		mode: 'onChange',
		resolver: zodResolver(systemPreferencesSchema),
		defaultValues: {
			accounting: 'NO',
			addressIssuingEstablishment: '',
			companyName: '',
			environmentType: '1',
			resolutionNumber: 10000, // Valor por defecto válido
			ruc: '',
			tradeName: '',
			typeIssue: 1,
			issuingEstablishmentCode: 1, // Valor por defecto válido
			issuingPointCode: 1, // Valor por defecto válido
			parentEstablishmentAddress: '',
			photo: undefined,
		},
	})

	const {
		handleSubmit,
		reset,
		setValue,
		formState: { isDirty, isValid, errors, isValidating, dirtyFields },
		control,
		watch,
		trigger,
		getValues,
	} = formMethods

	const currentPreferences = recordsData?.data?.items?.[0]

	// Debug: observar cambios en el formulario
	const watchedValues = watch()
	const currentValues = getValues()

	// Validación manual para debugging
	const debugValidation = async () => {
		try {
			const result = await systemPreferencesSchema.safeParseAsync(currentValues)
			console.log('Manual Zod validation:', result)
			if (!result.success) {
				console.log('Zod validation errors:', result.error.issues)
			}
		} catch (error) {
			console.log('Error in manual validation:', error)
		}
	}

	// Ejecutar validación de debug cuando cambien los valores
	React.useEffect(() => {
		debugValidation()
	}, [currentValues])

	console.log('=== FORM DEBUG INFO ===')
	console.log('Form values:', currentValues)
	console.log('Watched values:', watchedValues)
	console.log('Form errors:', errors)
	console.log('Is valid:', isValid)
	console.log('Is dirty:', isDirty)
	console.log('Is validating:', isValidating)
	console.log('Dirty fields:', dirtyFields)
	console.log('All form state keys:', Object.keys(formMethods.formState))
	console.log('========================')

	useEffect(() => {
		if (currentPreferences) {
			const formattedData: SystemPreferencesFormData = {
				accounting: (currentPreferences.accounting as 'SI' | 'NO') || 'NO',
				addressIssuingEstablishment: currentPreferences.addressIssuingEstablishment || '',
				companyName: currentPreferences.companyName || '',
				environmentType: (currentPreferences.environmentType?.toString() as '1' | '2') || '1',
				resolutionNumber: currentPreferences.resolutionNumber || 10000,
				ruc: currentPreferences.ruc || '',
				tradeName: currentPreferences.tradeName || '',
				typeIssue: 1,
				issuingEstablishmentCode: currentPreferences.issuingEstablishmentCode || 1,
				issuingPointCode: currentPreferences.issuingPointCode || 1,
				parentEstablishmentAddress: currentPreferences.parentEstablishmentAddress || '',
				// 🔥 CORRECCIÓN: Extraer solo el ID del objeto photo
				photo:
					typeof currentPreferences.photo === 'object' && currentPreferences.photo?.id
						? currentPreferences.photo.id
						: (currentPreferences.photo as string) || undefined,
			}
			console.log('Resetting form with:', formattedData)
			reset(formattedData)

			// Para la preview, usar el path del objeto
			if (currentPreferences.photo) {
				const imagePath =
					typeof currentPreferences.photo === 'object' ? currentPreferences.photo.path : currentPreferences.photo
				setPreviewImage(imagePath)
			}
		}
	}, [currentPreferences, reset, setPreviewImage])

	const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<string | null> => {
		const file = e.target.files?.[0]
		if (!file) return null

		try {
			const fileId = await uploadFile(file)
			if (fileId) {
				setValue('photo', fileId, { shouldDirty: true, shouldValidate: true })
			}
			return fileId
		} catch (error) {
			console.error('Error uploading file:', error)
			toast.error('Error al subir la imagen')
			return null
		}
	}

	const onSubmit = async (data: SystemPreferencesFormData) => {
		console.log('Submit triggered with data:', data)

		try {
			const submitData = {
				accounting: data.accounting,
				addressIssuingEstablishment: data.addressIssuingEstablishment.trim(),
				companyName: data.companyName.trim(),
				environmentType: Number(data.environmentType),
				resolutionNumber: data.resolutionNumber,
				ruc: data.ruc.trim(),
				tradeName: data.tradeName.trim(),
				typeIssue: 1,
				issuingEstablishmentCode: data.issuingEstablishmentCode,
				issuingPointCode: data.issuingPointCode,
				parentEstablishmentAddress: data.parentEstablishmentAddress?.trim() || null,
				photo: data.photo || null,
			}

			console.log('Submitting data:', submitData)

			let result
			if (currentPreferences?.id) {
				console.log('Updating record with ID:', currentPreferences.id)
				result = await updateRecord(currentPreferences.id, submitData)
			} else {
				console.log('Creating new record')
				result = await createRecord(submitData)
			}

			console.log('Operation result:', result)

			// Reset form with new data to clear dirty state
			reset(data)
			toast.success(
				currentPreferences?.id ? 'Configuración actualizada correctamente' : 'Configuración creada correctamente'
			)
		} catch (error: any) {
			console.error('Error saving establishment settings:', error)
			toast.error(`Error al guardar: ${error?.message || 'Error desconocido'}`)
		}
	}

	const handleReset = () => {
		if (currentPreferences) {
			const formattedData: SystemPreferencesFormData = {
				accounting: (currentPreferences.accounting as 'SI' | 'NO') || 'NO',
				addressIssuingEstablishment: currentPreferences.addressIssuingEstablishment || '',
				companyName: currentPreferences.companyName || '',
				environmentType: (currentPreferences.environmentType?.toString() as '1' | '2') || '1',
				resolutionNumber: currentPreferences.resolutionNumber || 10000,
				ruc: currentPreferences.ruc || '',
				tradeName: currentPreferences.tradeName || '',
				typeIssue: 1,
				issuingEstablishmentCode: currentPreferences.issuingEstablishmentCode || 1,
				issuingPointCode: currentPreferences.issuingPointCode || 1,
				parentEstablishmentAddress: currentPreferences.parentEstablishmentAddress || '',
				photo: currentPreferences.photo || undefined,
			}
			reset(formattedData)
			if (currentPreferences.photo?.path) {
				setPreviewImage(currentPreferences.photo.path)
			} else {
				setPreviewImage(null)
			}
		} else {
			reset({
				accounting: 'NO',
				addressIssuingEstablishment: '',
				companyName: '',
				environmentType: '1',
				resolutionNumber: 10000,
				ruc: '',
				tradeName: '',
				typeIssue: 1,
				issuingEstablishmentCode: 1,
				issuingPointCode: 1,
				parentEstablishmentAddress: '',
				photo: undefined,
			})
			setPreviewImage(null)
		}
		clearPreview()
		toast.info('Cambios descartados')
	}

	// Función de debug para el botón
	const handleDebugSubmit = (e: React.FormEvent) => {
		console.log('Form submit event triggered', e)
		e.preventDefault() // Prevenir submit por defecto
		handleSubmit(onSubmit)(e) // Llamar manualmente al submit de react-hook-form
	}

	if (loading) return <div className='flex justify-center py-8'>Cargando configuración...</div>

	if (error) return <div className='text-red-500'>Error al cargar la configuración: {error}</div>

	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardContent className='space-y-6 p-0'>
				<FormProvider {...formMethods}>
					<form onSubmit={handleDebugSubmit} className='space-y-8'>
						<div className='space-y-4'>
							<CardHeaderInfo
								title='Información básica'
								description='Datos fundamentales de identificación de la empresa o persona natural, incluyendo imagen corporativa, razón social y nombre comercial.'
							/>

							<div className='grid grid-cols-1 gap-12 md:grid-cols-2'>
								<FileUploadSection
									fileInputRef={fileInputRef}
									previewImage={previewImage}
									currentImage={currentPreferences?.photo}
									isUploading={isUploading}
									onFileChange={onFileChange}
									onTriggerFileInput={triggerFileInput}
									onClearPreview={clearPreview}
									imageHeight={250}
									imageWidth={660}
								/>

								<div className='space-y-4'>
									<UniversalFormField
										control={control}
										name='companyName'
										label='Razón Social / Nombres y Apellidos'
										placeholder='Ingrese la razón social o nombres completos'
										type='text'
										required
									/>

									<UniversalFormField
										control={control}
										name='tradeName'
										label='Nombre Comercial'
										placeholder='Ingrese el nombre comercial'
										type='text'
										required
									/>

									<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
										<UniversalFormField
											control={control}
											name='ruc'
											label='RUC'
											placeholder='Ej. 1790012345001'
											type='text'
											required={true}
											showValidationIcons={true}
										/>

										<UniversalFormField
											control={control}
											name='accounting'
											label='¿Obligado a llevar contabilidad?'
											type='select'
											required
											options={[
												{ value: 'SI', label: 'Sí' },
												{ value: 'NO', label: 'No' },
											]}
										/>
									</div>
								</div>
							</div>
						</div>

						<div className='grid grid-cols-1 gap-12 md:grid-cols-2'>
							<div className='space-y-4'>
								<CardHeaderInfo
									title='Información Fiscal'
									description='Configuración relacionada con los documentos fiscales y autorizaciones del SRI, incluyendo número de resolución y tipo de ambiente.'
								/>
								<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
									<UniversalFormField
										control={control}
										name='resolutionNumber'
										label='Número de Resolución (5 dígitos)'
										placeholder='12345'
										type='number'
										required
									/>
									<UniversalFormField
										control={control}
										name='environmentType'
										label='Tipo de Ambiente'
										type='select'
										required
										options={[
											{ value: '1', label: 'Pruebas' },
											{ value: '2', label: 'Producción' },
										]}
									/>
								</div>
							</div>

							<div className='space-y-4'>
								<CardHeaderInfo
									title='Códigos'
									description='Identificadores numéricos asignados por el SRI para el establecimiento y punto de emisión, utilizados en la numeración de documentos.'
								/>

								<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
									<UniversalFormField
										control={control}
										name='issuingEstablishmentCode'
										label='Código del Establecimiento Emisor'
										placeholder='001'
										type='number'
										required
									/>

									<UniversalFormField
										control={control}
										name='issuingPointCode'
										label='Código Punto de Emisión'
										placeholder='001'
										type='number'
										required
									/>
								</div>
							</div>
						</div>

						<div className='space-y-4'>
							<CardHeaderInfo
								title='Direcciones'
								description='Ubicaciones físicas del establecimiento emisor y matriz (si aplica), necesarias para la facturación electrónica.'
							/>
							<div className='grid grid-cols-1 gap-12 md:grid-cols-2'>
								<UniversalFormField
									control={control}
									name='addressIssuingEstablishment'
									label='Dirección del Establecimiento Emisor'
									placeholder='Ingrese la dirección completa'
									type='text'
									required
								/>

								<UniversalFormField
									control={control}
									name='parentEstablishmentAddress'
									label='Dirección del Establecimiento Matriz'
									placeholder='Ingrese la dirección de la matriz'
									type='text'
									required
								/>
							</div>
						</div>

						<div className='flex justify-end gap-2 pt-6'>
							<ActionButton
								type='button'
								variant='ghost'
								disabled={isUpdating || !isDirty}
								onClick={handleReset}
								text='Descartar cambios'
							/>

							<ActionButton
								type='submit'
								disabled={isUpdating || !isDirty || !isValid}
								text={isUpdating ? 'Guardando...' : 'Guardar cambios'}
							/>
						</div>
					</form>
				</FormProvider>
			</CardContent>
		</Card>
	)
}
