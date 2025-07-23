'use client'

// Hook vacío que mantiene la interfaz pero sin funcionalidad de subida
export const useFileUpload = () => {
    return {
        // Valores por defecto que no requieren funcionalidad de subida
        previewImage: null,
        isUploading: false,
        fileInputRef: { current: null },
        uploadFile: async () => null,
        clearPreview: () => {},
        triggerFileInput: () => {},
        setPreviewImage: () => {},
    }
}