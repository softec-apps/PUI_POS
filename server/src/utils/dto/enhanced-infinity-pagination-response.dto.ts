import { Type } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'

export class EnhancedInfinityPaginationResponseDto<T> {
  items: T[]
  pagination: {
    totalRecords: number
    totalCount: number
    currentPage: number
    totalPages: number
    pageSize: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    firstPage: number
    lastPage: number
  }
}

export function EnhancedInfinityPaginationResponse<T>(classReference: Type<T>) {
  abstract class Pagination {
    @ApiProperty({ type: [classReference] })
    items!: T[]

    @ApiProperty({
      type: Object,
      required: false,
      description: 'Paginación con información detallada',
      example: {
        totalRecords: 100,
        totalCount: 10,
        currentPage: 1,
        totalPages: 10,
        pageSize: 10,
        hasNextPage: true,
        hasPreviousPage: false,
        firstPage: 1,
        lastPage: 10,
      },
    })
    pagination?: {
      totalRecords: number
      totalCount: number
      currentPage: number
      totalPages: number
      pageSize: number
      hasNextPage: boolean
      hasPreviousPage: boolean
      firstPage: number
      lastPage: number
    }
  }

  Object.defineProperty(Pagination, 'name', {
    writable: false,
    value: ` EnhancedInfinityPagination${classReference.name}ResponseDto`,
  })

  return Pagination
}
