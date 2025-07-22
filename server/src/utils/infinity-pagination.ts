import { IPaginationOptions } from './types/pagination-options'
import { InfinityPaginationResponseDto } from './dto/infinity-pagination-response.dto'
import { EnhancedInfinityPaginationResponseDto } from '@/utils/dto/enhanced-infinity-pagination-response.dto'

export const infinityPagination = <T>(
  data: T[],
  options: IPaginationOptions,
): InfinityPaginationResponseDto<T> => {
  return {
    data,
    hasNextPage: data.length === options.limit,
  }
}

export const infinityPaginationWithMetadata = <T>(
  items: T[],
  options: IPaginationOptions,
  totalCount: number,
  totalRecords: number,
): EnhancedInfinityPaginationResponseDto<T> => {
  const currentPage = options.page
  const pageSize = options.limit
  const totalPages = Math.ceil(totalCount / pageSize)
  const hasNextPage = currentPage < totalPages

  return {
    items,
    pagination: {
      totalRecords: totalRecords,
      totalCount: totalCount,
      currentPage,
      totalPages,
      pageSize,
      hasNextPage,
      hasPreviousPage: currentPage > 1,
      firstPage: 1,
      lastPage: totalPages,
    },
  }
}
