import { useCategory } from '@/common/hooks/useCategory'

export const useProductCategory = () => {
  const { categories, loading, refetchCategories } = useCategory({ limit: 100 })

  return {
    recordsData: categories,
    isLoading: loading,
    fetchData: refetchCategories,
  }
}
