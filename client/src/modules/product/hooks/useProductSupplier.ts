import { useSupplier } from '@/common/hooks/useSupplier'

export const useProductSupplier = () => {
  const { supplierData, loading, refetchRecords } = useSupplier({ limit: 100 })

  return {
    recordsData: supplierData,
    isLoading: loading,
    fetchData: refetchRecords,
  }
}
