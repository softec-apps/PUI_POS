'use client'

import api from '@/lib/axios'
import { toast } from 'sonner'
import { useCallback, useRef, useState } from 'react'
import { FileUploadResponse_I } from '@/common/types/file'
import { FILE_SIZES, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '@/common/constants/file-const'

interface UseFileUploadOptions {
	maxSize?: number
	allowedTypes?: string[]
	showPreview?: boolean
}

export const useFileUpload = (options?: UseFileUploadOptions) => {
	const [previewImage, setPreviewImage] = useState<string | null>(null)
	const [isUploading, setIsUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	// Configuración por defecto con opciones personalizadas
	const config = {
		maxSize: options?.maxSize || MAX_FILE_SIZE.SMALL,
		allowedTypes: options?.allowedTypes || ALLOWED_IMAGE_TYPES,
		showPreview: options?.showPreview ?? true, // Preview habilitado por defecto
	}

	const validateFile = useCallback(
		(file: File): string | null => {
			if (file.size > config.maxSize) {
				const maxSizeMB = config.maxSize / FILE_SIZES.MB
				return `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`
			}

			if (!config.allowedTypes.includes(file.type)) {
				const allowedExtensions = config.allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')
				return `Formato no válido. Formatos aceptados: ${allowedExtensions}`
			}

			return null
		},
		[config.maxSize, config.allowedTypes]
	)

	const uploadFile = useCallback(
		async (file: File): Promise<string | null> => {
			const validationError = validateFile(file)
			if (validationError) {
				toast.error(validationError)
				return null
			}

			try {
				setIsUploading(true)
				const formData = new FormData()
				formData.append('file', file)

				const response = await api.post<FileUploadResponse_I>('/files/upload', formData, {
					headers: { 'Content-Type': 'multipart/form-data' },
				})

				// Generar preview solo si está habilitado
				if (config.showPreview) {
					const reader = new FileReader()
					reader.onload = () => setPreviewImage(reader.result as string)
					reader.readAsDataURL(file)
				}

				toast.success('Archivo subido correctamente')
				return response.data.file.id
			} catch (error) {
				toast.error('Error al subir el archivo')
				console.error('Upload error:', error)
				return null
			} finally {
				setIsUploading(false)
			}
		},
		[validateFile, config.showPreview]
	)

	const clearPreview = useCallback(() => {
		setPreviewImage(null)
		if (fileInputRef.current) fileInputRef.current.value = '' // Limpiar el input file
	}, [])

	const triggerFileInput = useCallback(() => {
		fileInputRef.current?.click()
	}, [])

	return {
		previewImage,
		isUploading,
		fileInputRef,
		uploadFile,
		clearPreview,
		triggerFileInput,
		setPreviewImage,
	}
}
