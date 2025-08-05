import { useForm } from 'react-hook-form'
import { useCategory } from '@/common/hooks/useCategory'
import { useAttribute } from '@/common/hooks/useAttribute'
import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { templateSchema, TemplateFormData } from '@/modules/template/types/template-form'

export function useTemplateForm(currentTemplate?: any) {
	// Estados para búsqueda
	const [categorySearch, setCategorySearch] = useState('')
	const [attributeSearch, setAttributeSearch] = useState('')
	const [categoryOpen, setCategoryOpen] = useState(false)
	const [attributeOpen, setAttributeOpen] = useState(false)
	const [categoryPage, setCategoryPage] = useState(1)
	const [attributePage, setAttributePage] = useState(1)
	const [loadedAttributes, setLoadedAttributes] = useState<Record<string, any>>({})

	// Hook para categorías con búsqueda
	const { categories, loading: loadingCategories } = useCategory({
		page: categoryPage,
		limit: 10,
		search: categorySearch,
		filters: { status: 'active' },
	})

	// Hook para atributos con búsqueda
	const {
		attributes,
		loading: loadingAttributes,
		getAttributeById,
	} = useAttribute({
		page: attributePage,
		limit: 10,
		search: attributeSearch,
	})

	const form = useForm<TemplateFormData>({
		resolver: zodResolver(templateSchema),
		defaultValues: {
			name: '',
			description: '',
			categoryId: '',
			atributeIds: [],
		},
		mode: 'onChange',
	})

	// Inicializar con los atributos de la plantilla actual
	useEffect(() => {
		if (currentTemplate?.atributes) {
			const initialAttributes = currentTemplate.atributes.reduce(
				(acc, attr) => {
					// Si el atributo es un objeto, usarlo directamente
					if (typeof attr === 'object' && attr.id) acc[attr.id] = attr
					// Si es solo un string ID, crear un objeto básico
					else if (typeof attr === 'string') {
						acc[attr] = {
							id: attr,
							name: `Atributo (ID: ${attr})`,
							type: 'unknown',
							required: false,
						}
					}
					return acc
				},
				{} as Record<string, any>
			)
			setLoadedAttributes(initialAttributes)
		}
	}, [currentTemplate])

	// Función para cargar un atributo por ID
	const loadAttribute = async (id: string) => {
		if (!loadedAttributes[id]) {
			try {
				const attribute = await getAttributeById(id)
				setLoadedAttributes(prev => ({ ...prev, [id]: attribute }))
			} catch (error) {
				console.error(`Error loading attribute ${id}:`, error)
				setLoadedAttributes(prev => ({
					...prev,
					[id]: {
						id,
						name: `Atributo (ID: ${id})`,
						type: 'unknown',
						required: false,
					},
				}))
			}
		}
	}

	// Obtener todos los atributos seleccionados en orden
	const selectedAttributes = useMemo(() => {
		const selectedIds = form.watch('atributeIds') || []
		return selectedIds.map(id => loadedAttributes[id]).filter(Boolean)
	}, [form.watch('atributeIds'), loadedAttributes])

	// Cuando se selecciona un nuevo atributo
	const handleAddAttribute = (id: string) => {
		const currentIds = form.watch('atributeIds') || []
		if (!currentIds.includes(id)) {
			form.setValue('atributeIds', [...currentIds, id], {
				shouldValidate: true,
			})
			loadAttribute(id)
		}
	}

	// Función para remover un atributo específico
	const handleRemoveAttribute = (id: string) => {
		const currentIds = form.watch('atributeIds') || []
		const newIds = currentIds.filter(existingId => existingId !== id)
		form.setValue('atributeIds', newIds, { shouldValidate: true })
	}

	// Función para remover todos los atributos
	const handleRemoveAllAttributes = () => {
		form.setValue('atributeIds', [], { shouldValidate: true })
	}

	// Función para cargar más categorías
	const loadMoreCategories = () => {
		if (categories?.data?.hasNextPage) setCategoryPage(prev => prev + 1)
	}

	// Función para cargar más atributos
	const loadMoreAttributes = () => {
		if (attributes?.data?.hasNextPage) setAttributePage(prev => prev + 1)
	}

	const resetForm = () => {
		form.reset()
		setCategorySearch('')
		setAttributeSearch('')
		setCategoryPage(1)
		setAttributePage(1)
		setCategoryOpen(false)
		setAttributeOpen(false)
		setLoadedAttributes({})
	}

	return {
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
		handleRemoveAttribute,
		handleRemoveAllAttributes,
		loadMoreCategories,
		loadMoreAttributes,
		resetForm,
	}
}
