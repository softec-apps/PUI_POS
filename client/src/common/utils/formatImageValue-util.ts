export const formatImageValue = (value: any): string => {
	if (!value) return 'Sin imagen'

	// Si es un objeto, intentar extraer la URL
	if (typeof value === 'object' && value !== null) {
		const imageUrl = value.url || value.src || value.path || value.href
		return imageUrl && typeof imageUrl === 'string' ? imageUrl : 'Imagen disponible'
	}

	// Si ya es una string (URL), devolverla tal como está
	if (typeof value === 'string') return value

	return 'Formato de imagen no válido'
}
