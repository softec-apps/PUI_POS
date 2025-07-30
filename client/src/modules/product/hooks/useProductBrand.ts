import { useBrand } from '@/common/hooks/useBrand'

export const useProductBrand = () => {
  const { brands, loading, refetchBrands } = useBrand({ limit: 100 })

  return {
    recordsData: brands,
    isLoading: loading,
    fetchData: refetchBrands,
  }
}
