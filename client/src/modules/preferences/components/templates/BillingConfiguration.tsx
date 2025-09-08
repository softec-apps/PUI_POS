import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import React from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { UniversalFormField } from '@/components/layout/atoms/FormFieldZod'
import { ActionButton } from '@/components/layout/atoms/ActionButton'
import { useFileUpload } from '@/common/hooks/useFileUpload'
import { FatalErrorState } from '@/components/layout/organims/ErrorStateCard'
import { SpinnerLoader } from '@/components/layout/SpinnerLoader'
import { useBilling } from '@/common/hooks/useBilling'
import { Icons } from '@/components/icons'
import { AlertMessage } from '@/components/layout/atoms/Alert'

const billingConfigSchema = z.object({
	email: z.string().min(1, 'Email requerido').email('Formato de email inválido').max(255, 'Máximo 255 caracteres'),
	password: z.string().min(1, 'Contraseña requerida').min(6, 'Mínimo 6 caracteres').max(255, 'Máximo 255 caracteres'),
	signatureKey: z.string().optional(),
})

type BillingConfigFormData = z.infer<typeof billingConfigSchema>

interface ProfileInfo {
	id: number
	name: string
	email: string
	ruc: string
	razonSocial: string
	nombreComercial: string
	dirMatriz: string
	contribuyenteEspecial: string | null
	obligadoContabilidad: boolean
	ambiente: number
	tarifa: string
	signature_expires_at: string | null
	logo_path: string | null
	enviar_factura_por_correo: boolean
	active_account: number
}

interface SignatureInfo {
	fileName?: string
	uploadDate?: string
	expirationDate?: string
	expires_at?: string
	issuer?: string
	subject?: string
	isValid?: boolean
	valid?: boolean
	serialNumber?: string
}

export function BillingConfiguration() {
	const {
		recordsData,
		loading,
		error,
		updateRecord,
		isUpdating,
		createRecord,
		uploadSignature,
		isUploadingSignature,
		getSignatureInfo,
		getProfile,
	} = useBilling()

	const { fileInputRef } = useFileUpload({ showPreview: false })

	const [signatureFile, setSignatureFile] = useState<File | null>(null)
	const [signatureInfo, setSignatureInfo] = useState<SignatureInfo | null>(null)
	const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null)
	const [loadingSignatureInfo, setLoadingSignatureInfo] = useState(false)
	const [loadingProfile, setLoadingProfile] = useState(false)
	const [showUploadForm, setShowUploadForm] = useState(false)

	const formMethods = useForm<BillingConfigFormData>({
		mode: 'onChange',
		resolver: zodResolver(billingConfigSchema),
		defaultValues: {
			email: '',
			password: '',
			signatureKey: '',
		},
	})

	const {
		handleSubmit,
		reset,
		setValue,
		formState: { isDirty, isValid, errors, isValidating },
		control,
		watch,
		getValues,
	} = formMethods

	const currentConfig = recordsData?.data?.[0]

	useEffect(() => {
		if (currentConfig) {
			const formattedData: BillingConfigFormData = {
				email: currentConfig.email || '',
				password: currentConfig.password || '',
				signatureKey: '',
			}
			reset(formattedData)
		}
	}, [currentConfig, reset])

	// Cargar información de perfil y firma al montar el componente
	useEffect(() => {
		loadProfileAndSignatureInfo()
	}, [])

	const loadProfileAndSignatureInfo = async () => await Promise.all([loadProfileInfo(), loadSignatureInfo()])

	const loadProfileInfo = async () => {
		setLoadingProfile(true)
		try {
			const profile = await getProfile()
			setProfileInfo(profile)
		} catch (error) {
			console.error('Error loading profile info:', error)
			setProfileInfo(null)
		} finally {
			setLoadingProfile(false)
		}
	}

	const loadSignatureInfo = async () => {
		setLoadingSignatureInfo(true)
		try {
			const response = await getSignatureInfo()
			if (response) {
				setSignatureInfo(response)
				setShowUploadForm(false)
			} else {
				setSignatureInfo(null)
				setShowUploadForm(true)
			}
		} catch (error) {
			console.error('Error loading signature info:', error)
			setSignatureInfo(null)
			setShowUploadForm(true)
		} finally {
			setLoadingSignatureInfo(false)
		}
	}

	const onSignatureFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
		const file = e.target.files?.[0]
		if (!file) return

		// Validar que sea un archivo .p12
		if (!file.name.toLowerCase().endsWith('.p12')) {
			toast.error('El archivo debe tener extensión .p12')
			return
		}

		// Validar tamaño (máximo 5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error('El archivo no debe superar los 5MB')
			return
		}

		setSignatureFile(file)
		toast.success(`Archivo seleccionado: ${file.name}`)
	}

	const handleUploadSignature = async () => {
		if (!signatureFile) {
			toast.error('Selecciona un archivo de firma primero')
			return
		}

		const signatureKey = getValues('signatureKey')
		if (!signatureKey) {
			toast.error('Ingresa la clave de la firma digital')
			return
		}

		try {
			await uploadSignature(signatureFile, signatureKey)
			toast.success('Firma digital subida exitosamente')
			setSignatureFile(null)
			setValue('signatureKey', '')
			// Recargar información de perfil y firma
			await loadProfileAndSignatureInfo()
		} catch (error: any) {
			toast.error(`${error?.message}`)
		}
	}

	const resetSignatureProcess = () => {
		setSignatureFile(null)
		setValue('signatureKey', '')
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}

	const handleDeleteSignature = async () => {
		// Aquí deberías agregar la funcionalidad para eliminar la firma
		// Por ejemplo: await deleteSignature()
		// Por ahora, simulamos la eliminación
		setSignatureInfo(null)
		setShowUploadForm(true)
		toast.success('Firma digital eliminada correctamente')
	}

	const onSubmit = async (data: BillingConfigFormData) => {
		try {
			const submitData = {
				email: data.email.trim(),
				password: data.password.trim(),
			}

			let result
			if (currentConfig?.id) {
				result = await updateRecord(currentConfig.id, submitData)
			} else {
				result = await createRecord(submitData)
			}

			reset(data)
			toast.success(
				currentConfig?.id
					? 'Configuración de billing actualizada correctamente'
					: 'Configuración de billing creada correctamente'
			)
		} catch (error: any) {
			console.error('Error saving billing config:', error)
			toast.error(`Error al guardar: ${error?.message || 'Error desconocido'}`)
		}
	}

	const handleReset = () => {
		if (currentConfig) {
			const formattedData: BillingConfigFormData = {
				email: currentConfig.email || '',
				password: '',
				signatureKey: '',
			}
			reset(formattedData)
		} else {
			reset({
				email: '',
				password: '',
				signatureKey: '',
			})
		}
		resetSignatureProcess()
		toast.info('Cambios descartados')
	}

	const handleDebugSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		handleSubmit(onSubmit)(e)
	}

	const formatDate = (dateString?: string | null) => {
		if (!dateString) return 'No disponible'
		try {
			return new Date(dateString).toLocaleDateString('es-ES', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
			})
		} catch {
			return dateString
		}
	}

	const isSignatureExpired = (expirationDate?: string | null) => {
		// Primero verifica desde el perfil, luego desde signatureInfo
		const dateToCheck = profileInfo?.signature_expires_at || expirationDate || signatureInfo?.expires_at
		if (!dateToCheck) return false
		try {
			return new Date(dateToCheck) < new Date()
		} catch {
			return false
		}
	}

	const getSignatureStatus = () => {
		// Si hay información en el perfil sobre la firma
		if (profileInfo?.signature_expires_at) {
			const isExpired = isSignatureExpired()
			const daysUntilExpiry = Math.ceil(
				(new Date(profileInfo.signature_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
			)

			if (isExpired) {
				return {
					status: 'expired',
					message: 'Firma digital vencida',
					variant: 'destructive' as const,
					description: 'La firma digital ha vencido. Es necesario cargar una nueva firma para continuar facturando.',
					icon: <Icons.alertTriangle className='text-red-500' size={16} />,
				}
			} else if (daysUntilExpiry <= 30) {
				return {
					status: 'warning',
					message: `Firma digital próxima a vencer (${daysUntilExpiry} días)`,
					variant: 'warning' as const,
					description: 'Te recomendamos renovar tu firma digital pronto para evitar interrupciones.',
					icon: <Icons.infoCircle className='text-yellow-500' size={16} />,
				}
			} else {
				return {
					status: 'valid',
					message: 'Firma digital válida',
					variant: 'success' as const,
					description: `Válida hasta ${formatDate(profileInfo.signature_expires_at)}`,
					icon: <Icons.rosetteDiscountCheck className='text-green-500' size={16} />,
				}
			}
		}

		// Si no hay información en el perfil, usar signatureInfo
		if (signatureInfo) {
			const isExpired = isSignatureExpired()
			return {
				status: isExpired ? 'expired' : 'valid',
				message: isExpired ? 'Firma digital vencida' : 'Firma digital configurada y valida',
				variant: (isExpired ? 'destructive' : 'success') as const,
			}
		}

		return {
			status: 'missing',
			message: 'Sin firma digital',
			variant: 'warning' as const,
			description: 'Es necesario cargar una firma digital para poder facturar electrónicamente.',
			icon: <Icons.infoCircle className='text-yellow-500' size={16} />,
		}
	}

	const handleCancelUpload = () => {
		setShowUploadForm(false)
		resetSignatureProcess()
	}

	if (loading || loadingProfile) {
		return (
			<div className='p-12'>
				<SpinnerLoader text='Cargando configuración de billing...' />
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

	const signatureStatus = getSignatureStatus()
	const hasSignature = profileInfo?.signature_expires_at || signatureInfo

	return (
		<FormProvider {...formMethods}>
			<div className='space-y-10'>
				{/* Información de estado detallada */}
				<div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
					<Card className='border-none bg-transparent p-0'>
						<CardHeader className='p-0'>
							<CardTitle className='flex items-center gap-2'>Credenciales de Factus Zen</CardTitle>
							<CardDescription>
								Configuración de integración con Factus Zen (facturación electrónica). Estas credenciales son necesarias
								para autenticarse con el servicio externo.
							</CardDescription>
						</CardHeader>

						<CardContent className='p-0'>
							<form onSubmit={handleDebugSubmit} className='space-y-4'>
								<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
									<UniversalFormField
										control={control}
										name='email'
										label='Email de la API'
										placeholder='usuario@ejemplo.com'
										type='email'
										required
									/>

									<UniversalFormField
										control={control}
										name='password'
										label='Contraseña de la API'
										placeholder='Ingrese la contraseña'
										type='password'
										required
									/>
								</div>

								<div className='flex justify-end gap-2'>
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
										text={isUpdating ? 'Guardando...' : 'Guardar configuración'}
									/>
								</div>
							</form>
						</CardContent>
					</Card>

					{/* Panel de firma digital mejorado */}
					<Card className='border-none bg-transparent p-0'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>Firma Digital</CardTitle>
							<CardDescription>
								Certificado digital PKCS#12 (.p12) para firmar electrónicamente los comprobantes fiscales.
							</CardDescription>
						</CardHeader>

						<CardContent>
							{loadingSignatureInfo ? (
								<div className='flex items-center justify-center py-8'>
									<SpinnerLoader text='Cargando información de firma...' />
								</div>
							) : (
								<>
									{/* Estado actual de la firma */}
									{!showUploadForm && (
										<div className='mb-6'>
											<AlertMessage
												title={signatureStatus.message}
												message={signatureStatus.description}
												variant={signatureStatus.variant}
											/>
										</div>
									)}

									{/* Información detallada de la firma si existe */}
									{hasSignature && !showUploadForm && (
										<div className='flex justify-end gap-2'>
											<ActionButton
												type='button'
												onClick={() => setShowUploadForm(true)}
												text='Cambiar Firma'
												variant='destructive'
												icon={<Icons.cloudUpload size={16} />}
											/>

											{/* Botón de eliminar firma si es necesario */}
											{signatureStatus.status === 'expired' && (
												<ActionButton
													type='button'
													onClick={handleDeleteSignature}
													text='Eliminar Firma'
													variant='destructive'
													size='sm'
													icon={<Icons.trash size={16} />}
												/>
											)}
										</div>
									)}

									{/* Formulario de carga - se muestra cuando no hay firma O cuando se quiere cambiar */}
									{(showUploadForm || !hasSignature) && <>{renderUploadForm()}</>}
								</>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</FormProvider>
	)

	function renderUploadForm() {
		return (
			<div className='space-y-4'>
				<div
					className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center ${
						signatureFile
							? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/10'
							: 'border-border hover:border-border'
					} cursor-pointer transition-colors`}
					onClick={() => fileInputRef.current?.click()}>
					<input ref={fileInputRef} type='file' accept='.p12' onChange={onSignatureFileChange} className='hidden' />

					{signatureFile ? (
						<>
							<Icons.rosetteDiscountCheck className='mb-2 text-emerald-500' size={32} />
							<p className='text-sm font-medium text-emerald-800 dark:text-emerald-200'>{signatureFile.name}</p>
							<p className='mt-1 text-xs text-emerald-600 dark:text-emerald-400'>
								{(signatureFile.size / 1024).toFixed(0)} KB - Listo para subir
							</p>
						</>
					) : (
						<>
							<Icons.cloudUpload className='mb-2 text-gray-400' size={32} />
							<p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
								Haz clic para seleccionar un archivo
							</p>
							<p className='text-muted-foreground mt-1 text-xs'>Formatos admitidos: .p12 (máximo 5MB)</p>
						</>
					)}
				</div>

				{signatureFile && (
					<div className='flex justify-end'>
						<ActionButton
							type='button'
							text='Cambiar archivo'
							variant='ghost'
							size='sm'
							onClick={() => fileInputRef.current?.click()}
							disabled={!signatureFile || isUploadingSignature}
						/>
					</div>
				)}

				<div className='animate-fade-in'>
					<UniversalFormField
						control={control}
						name='signatureKey'
						label='Clave'
						placeholder='Ingresa la clave de tu certificado'
						type='password'
						description='La contraseña que protege tu certificado digital .p12'
						required
					/>
				</div>

				{/* Botones de acción */}
				<div className='flex justify-end gap-2'>
					{/* Botón cancelar solo si estamos cambiando una firma existente */}
					{hasSignature && showUploadForm && (
						<ActionButton
							type='button'
							variant='ghost'
							disabled={!signatureFile || isUploadingSignature}
							onClick={handleCancelUpload}
							text='Cancelar'
							className='flex-1'
						/>
					)}

					<ActionButton
						type='button'
						disabled={!signatureFile || !watch('signatureKey') || isUploadingSignature}
						onClick={handleUploadSignature}
						text={isUploadingSignature ? 'Subiendo...' : 'Subir firma'}
						className={hasSignature && showUploadForm ? 'flex-1' : 'w-full'}
						icon={
							isUploadingSignature ? (
								<Icons.spinnerSimple className='animate-spin' size={16} />
							) : (
								<Icons.cloudUpload size={16} />
							)
						}
					/>
				</div>
			</div>
		)
	}
}
