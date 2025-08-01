'use client'

import { useEffect, useState, useRef } from 'react'
import { useDebounce } from '@/common/hooks/useDebounce'
import { useProductCategory } from './useProductCategory'
import { useProductBrand } from './useProductBrand'
import { useProductSupplier } from './useProductSupplier'
import { useProductTemplate } from './useProductTemplate'
import { useFileUpload } from '@/common/hooks/useFileUpload'

import { I_Product } from '@/modules/product/types/product'

export const useProductModal = (currentRecord: I_Product | null) => {
  const [categoryPage, setCategoryPage] = useState(1)
  const [brandPage, setBrandPage] = useState(1)
  const [supplierPage, setSupplierPage] = useState(1)
  const [templatePage, setTemplatePage] = useState(1)

  const [categorySearch, setCategorySearch] = useState('')
  const [brandSearch, setBrandSearch] = useState('')
  const [supplierSearch, setSupplierSearch] = useState('')
  const [templateSearch, setTemplateSearch] = useState('')

  const debouncedCategorySearch = useDebounce(categorySearch, 500)
  const debouncedBrandSearch = useDebounce(brandSearch, 500)
  const debouncedSupplierSearch = useDebounce(supplierSearch, 500)
  const debouncedTemplateSearch = useDebounce(templateSearch, 500)

  const [categoryOpen, setCategoryOpen] = useState(false)
  const [brandOpen, setBrandOpen] = useState(false)
  const [supplierOpen, setSupplierOpen] = useState(false)
  const [templateOpen, setTemplateOpen] = useState(false)

  const {
    recordsData: categoriesData,
    isLoading: loadingCategories,
    fetchData: fetchCategories,
  } = useProductCategory()

  const {
    recordsData: brandsData,
    isLoading: loadingBrands,
    fetchData: fetchBrands,
  } = useProductBrand()

  const {
    recordsData: suppliersData,
    isLoading: loadingSuppliers,
    fetchData: fetchSuppliers,
  } = useProductSupplier()

  const {
    templatesData,
    loadingTemplates,
    fetchTemplates,
  } = useProductTemplate()

  const augmentedSuppliersData = () => {
    const items = suppliersData?.data?.items || []
    if (currentRecord?.supplier && !items.find((s) => s.id === currentRecord.supplier.id)) {
      return [currentRecord.supplier, ...items]
    }
    return items
  }

  const augmentedTemplatesData = () => {
    const items = templatesData?.data?.items || []
    if (currentRecord?.template && !items.find((t) => t.id === currentRecord.template.id)) {
      return {
        ...templatesData,
        data: {
          ...templatesData.data,
          items: [currentRecord.template, ...items],
        },
      }
    }
    return templatesData
  }

  const {
    fileInputRef,
    previewImage,
    isUploading,
    handleFileChange,
    triggerFileInput,
    clearPreview,
    setPreviewImage,
  } = useFileUpload()

  useEffect(() => {
    if (categoryOpen) {
      fetchCategories({ search: debouncedCategorySearch, page: 1, limit: 10 })
    }
  }, [debouncedCategorySearch, fetchCategories, categoryOpen])

  useEffect(() => {
    if (brandOpen) {
      fetchBrands({ search: debouncedBrandSearch, page: 1, limit: 10 })
    }
  }, [debouncedBrandSearch, fetchBrands, brandOpen])

  useEffect(() => {
    if (supplierOpen) {
      fetchSuppliers({ search: debouncedSupplierSearch, page: 1, limit: 10 })
    }
  }, [debouncedSupplierSearch, fetchSuppliers, supplierOpen])

  useEffect(() => {
    if (templateOpen) {
      fetchTemplates({ search: debouncedTemplateSearch, page: 1, limit: 10 })
    }
  }, [debouncedTemplateSearch, fetchTemplates, templateOpen])

  const loadMoreCategories = () => {
    if (categoriesData?.data?.hasNextPage) {
      fetchCategories({ page: categoryPage + 1, search: debouncedCategorySearch })
      setCategoryPage(prev => prev + 1)
    }
  }

  const loadMoreBrands = () => {
    if (brandsData?.data?.hasNextPage) {
      fetchBrands({ page: brandPage + 1, search: debouncedBrandSearch })
      setBrandPage(prev => prev + 1)
    }
  }

  const loadMoreSuppliers = () => {
    if (suppliersData?.data?.hasNextPage) {
      fetchSuppliers({ page: supplierPage + 1, search: debouncedSupplierSearch })
      setSupplierPage(prev => prev + 1)
    }
  }

  const loadMoreTemplates = () => {
    if (templatesData?.data?.hasNextPage) {
      fetchTemplates({ page: templatePage + 1, search: debouncedTemplateSearch })
      setTemplatePage(prev => prev + 1)
    }
  }

  return {
    categoriesData,
    loadingCategories,
    categorySearch,
    setCategorySearch,
    categoryOpen,
    setCategoryOpen,
    loadMoreCategories,
    brandsData,
    loadingBrands,
    brandSearch,
    setBrandSearch,
    brandOpen,
    setBrandOpen,
    loadMoreBrands,
    suppliersData: augmentedSuppliersData(),
    loadingSuppliers,
    supplierSearch,
    setSupplierSearch,
    supplierOpen,
    setSupplierOpen,
    loadMoreSuppliers,
    fileInputRef,
    previewImage,
    isUploading,
    handleFileChange,
    triggerFileInput,
    clearPreview,
    setPreviewImage,
    templatesData: augmentedTemplatesData(),
    loadingTemplates,
    templateSearch,
    setTemplateSearch,
    templateOpen,
    setTemplateOpen,
    loadMoreTemplates,
  }
}
