export const FILE_SIZES = {
	KB: 1024,
	MB: 1024 * 1024,
	GB: 1024 * 1024 * 1024,
}

export const MAX_FILE_SIZE = {
	SMALL: 1 * FILE_SIZES.MB, // 1MB - Para iconos o imágenes pequeñas
	MEDIUM: 5 * FILE_SIZES.MB, // 5MB - Para imágenes normales (valor original)
	LARGE: 10 * FILE_SIZES.MB, // 10MB - Para imágenes de alta calidad
	DOCUMENT: 2 * FILE_SIZES.MB, // 2MB - Para documentos PDF/Word
	VIDEO_THUMBNAIL: 3 * FILE_SIZES.MB, // 3MB - Para miniaturas de video
	AVATAR: 2 * FILE_SIZES.MB, // 2MB - Para fotos de perfil
	EXTRA_LARGE: 25 * FILE_SIZES.MB, // 25MB - Para casos especiales
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
