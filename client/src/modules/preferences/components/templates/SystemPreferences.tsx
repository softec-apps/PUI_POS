'use client'

import { toast } from 'sonner'
import { useEffect, useRef } from 'react'
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
import { FatalErrorState } from '@/components/layout/organims/ErrorStateCard'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'

const systemPreferencesSchema = z.object({
	accounting: z
		.string()
		.optional()
		.transform(val => {
			// Si no hay valor o es vacío, usar 'NO' como default
			if (!val || val.trim() === '') {
				return 'NO'
			}
			// Normalizar el valor para asegurar que sea exactamente 'SI' o 'NO'
			const normalized = val.toUpperCase().trim()
			return normalized === 'SI' || normalized === 'SÍ' ? 'SI' : 'NO'
		})
		.pipe(
			z.enum(['SI', 'NO'], {
				required_error: 'Campo requerido',
				invalid_type_error: 'Debe seleccionar SI o NO',
			})
		),
	parentEstablishmentAddress: z.string().min(1, 'Campo requerido').max(300, 'Máximo 300 caracteres'),
	companyName: z.string().min(1, 'Campo requerido').max(300, 'Máximo 300 caracteres'),
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
	photo: z.string().optional(),
})

type SystemPreferencesFormData = z.infer<typeof systemPreferencesSchema>

export function SystemPreferences() {
	const { recordsData, loading, error, updateRecord, isUpdating, createRecord } = useEstablishment()
	const { previewImage, isUploading, fileInputRef, uploadFile, clearPreview, triggerFileInput, setPreviewImage } =
		useFileUpload({ showPreview: true })

	// Ref para controlar si ya se inicializó el formulario
	const formInitialized = useRef(false)

	const formMethods = useForm<SystemPreferencesFormData>({
		mode: 'onChange',
		resolver: zodResolver(systemPreferencesSchema),
		defaultValues: {
			photo: undefined,
			ruc: '',
			tradeName: '',
			companyName: '',
			parentEstablishmentAddress: '',
			accounting: 'NO',
		},
	})

	const {
		handleSubmit,
		reset,
		setValue,
		formState: { isDirty, isValid, errors, isValidating, dirtyFields },
		control,
		watch,
		getValues,
	} = formMethods

	const currentPreferences = recordsData?.data?.items?.[0]

	// Inicializar formulario solo una vez cuando se cargan los datos
	useEffect(() => {
		if (currentPreferences && !formInitialized.current) {
			// Normalizar el valor de accounting con validación más robusta

			let accountingValue: 'SI' | 'NO' = 'NO'
			if (currentPreferences.accounting !== undefined && currentPreferences.accounting !== null) {
				const normalizedAccounting = String(currentPreferences.accounting).toUpperCase().trim()
				accountingValue = (normalizedAccounting === 'SI' || normalizedAccounting === 'SÍ' ? 'SI' : 'NO') as 'SI' | 'NO'
			}
			const formattedData: SystemPreferencesFormData = {
				photo:
					typeof currentPreferences.photo === 'object' && currentPreferences.photo?.id
						? currentPreferences.photo.id
						: (currentPreferences.photo as string) || undefined,
				ruc: currentPreferences?.ruc || '',
				tradeName: currentPreferences.tradeName || '',
				companyName: currentPreferences.companyName || '',
				parentEstablishmentAddress: currentPreferences.parentEstablishmentAddress || '',
				accounting: accountingValue,
			}

			reset(formattedData)

			// Para la preview, usar el path del objeto
			if (currentPreferences.photo) {
				const imagePath =
					typeof currentPreferences.photo === 'object' ? currentPreferences.photo.path : currentPreferences.photo
				setPreviewImage(imagePath)
			}

			formInitialized.current = true
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
			toast.error('Error al subir la imagen')
			return null
		}
	}

	const onSubmit = async (data: SystemPreferencesFormData) => {
		try {
			const submitData = {
				photo: data.photo || null,
				ruc: data.ruc.trim(),
				tradeName: data.tradeName.trim(),
				companyName: data.companyName.trim(),
				parentEstablishmentAddress: data.parentEstablishmentAddress.trim(),
				accounting: data.accounting as string,
			}

			let result
			if (currentPreferences?.id) {
				result = await updateRecord(currentPreferences.id, submitData)
			} else {
				result = await createRecord(submitData)
			}

			// Marcar como inicializado después de guardar exitosamente
			formInitialized.current = true

			// Reset form con los nuevos datos para limpiar el estado dirty
			reset(data)
		} catch (error: any) {
			console.error('Error saving preferences:', error)
		}
	}

	const handleReset = () => {
		if (currentPreferences) {
			// Normalizar el valor de accounting con validación más robusta
			let accountingValue: 'SI' | 'NO' = 'NO'
			if (currentPreferences.accounting !== undefined && currentPreferences.accounting !== null) {
				const normalizedAccounting = String(currentPreferences.accounting).toUpperCase().trim() as string
				accountingValue = normalizedAccounting === 'SI' || normalizedAccounting === 'SÍ' ? 'SI' : 'NO'
			}

			const formattedData: SystemPreferencesFormData = {
				photo:
					typeof currentPreferences.photo === 'object' && currentPreferences.photo?.id
						? currentPreferences.photo.id
						: (currentPreferences.photo as string) || undefined,
				ruc: currentPreferences.ruc || '',
				tradeName: currentPreferences.tradeName || '',
				companyName: currentPreferences.companyName || '',
				parentEstablishmentAddress: currentPreferences.parentEstablishmentAddress || '',
				accounting: accountingValue,
			}
			reset(formattedData)

			// Restaurar imagen original
			if (currentPreferences.photo) {
				const imagePath =
					typeof currentPreferences.photo === 'object' ? currentPreferences.photo.path : currentPreferences.photo
				setPreviewImage(imagePath)
			} else {
				setPreviewImage(null)
			}
		} else {
			// Reset a valores por defecto si no hay datos previos
			reset({
				photo: undefined,
				ruc: '',
				companyName: '',
				tradeName: '',
				parentEstablishmentAddress: '',
				accounting: 'NO',
			})
			setPreviewImage(null)
		}
		clearPreview()
		toast.info('Cambios descartados')
	}

	// Función mejorada para el submit del formulario
	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		// Ejecutar el submit de react-hook-form
		handleSubmit(onSubmit, () => {
			toast.error('Por favor corrige los errores en el formulario')
		})(e)
	}

	if (loading) {
		return (
			<div className='p-12'>
				<SpinnerLoader text='Cargando... Por favor espera' />
			</div>
		)
	}

	if (error) {
		return (
			<div className='p-12'>
				<FatalErrorState />
			</div>
		)
	}

	return (
		<Card className='border-none bg-transparent p-0 shadow-none'>
			<CardContent className='space-y-6 p-0'>
				<FormProvider {...formMethods}>
					<form onSubmit={handleFormSubmit} className='space-y-8'>
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
									<div className='grid grid-cols-2 gap-4'>
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
									</div>

									<UniversalFormField
										control={control}
										name='parentEstablishmentAddress'
										label='Dirección matriz'
										placeholder='Ingrese la dirección completa'
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
											placeholder='Seleccione una opción'
										/>
									</div>
								</div>
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
