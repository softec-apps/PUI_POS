import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useBrand } from '@/common/hooks/useBrand'
import { useCategory } from '@/common/hooks/useCategory'
import { useSupplier } from '@/common/hooks/useSupplier'

import { ProductSchema, ProductFormData } from '@/modules/product/types/product-form'
import { useTemplate } from '@/common/hooks/useTemplate'

export function useProductForm() {
	const [categoryPage, setCategoryPage] = useState(1)
	const [categorySearch, setCategorySearch] = useState('')
	const [categoryOpen, setCategoryOpen] = useState(false)

	const [brandPage, setBrandPage] = useState(1)
	const [brandSearch, setBrandSearch] = useState('')
	const [brandOpen, setBrandOpen] = useState(false)

	const [supplierPage, setSupplierPage] = useState(1)
	const [supplierSearch, setSupplierSearch] = useState('')
	const [supplierOpen, setSupplierOpen] = useState(false)

	const [templatePage, setTemplatePage] = useState(1)
	const [templateSearch, setTemplateSearch] = useState('')
	const [templateOpen, setTemplateOpen] = useState(false)

	// Hook get all categories
	const { categories: categoriesData, loading: loadingCategories } = useCategory({
		page: categoryPage,
		limit: 10,
		search: categorySearch,
		filters: { status: 'active' },
	})

	// Hook get all brand
	const { brands: brandsData, loading: loadingBrands } = useBrand({
		page: brandPage,
		limit: 10,
		search: brandSearch,
		filters: { status: 'active' },
	})

	// Hook get all supplier
	const { supplierData: suppliersData, loading: loadingSuppliers } = useSupplier({
		page: supplierPage,
		limit: 10,
		search: supplierSearch,
		filters: { status: 'active' },
	})

	// Hook get all template
	const { template: templatesData, loading: loadingTemplates } = useTemplate({
		page: templatePage,
		limit: 10,
		search: templateSearch,
	})

	const form = useForm<ProductFormData>({
		resolver: zodResolver(ProductSchema),
		defaultValues: {
			name: '',
			description: '',
			status: '',
			photo: '',
			price: '',
			sku: '',
			barCode: '',
			stock: '',
			categoryId: '',
			brandId: '',
			supplierId: '',
			templateId: '',
		},
		mode: 'all',
	})

	const resetForm = () => {
		form.reset()

		setCategoryPage(1)
		setCategorySearch('')
		setCategoryOpen(false)

		setBrandPage(1)
		setBrandSearch('')
		setBrandOpen(false)

		setSupplierPage(1)
		setSupplierSearch('')
		setSupplierOpen(false)

		setTemplatePage(1)
		setTemplateSearch('')
		setTemplateOpen(false)
	}

	return {
		form,
		resetForm,

		// categories
		categoriesData,
		categorySearch,
		loadingCategories,
		setCategorySearch,
		categoryOpen,
		setCategoryOpen,

		// brands
		brandsData,
		brandSearch,
		loadingBrands,
		setBrandSearch,
		brandOpen,
		setBrandOpen,

		// suppliers
		suppliersData,
		supplierSearch,
		loadingSuppliers,
		setSupplierSearch,
		supplierOpen,
		setSupplierOpen,

		// templates
		templatesData,
		templateSearch,
		loadingTemplates,
		setTemplateSearch,
		templateOpen,
		setTemplateOpen,
	}
}
