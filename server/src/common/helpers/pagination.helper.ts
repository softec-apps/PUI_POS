export interface IPaginationMetadata {
  totalRecords: number
  currentPage: number
  totalPages: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface IPaginatedResponse<T> {
  data: T[]
  metadata: IPaginationMetadata
}

export class PaginationHelper {
  static createMetadata(
    totalRecords: number,
    currentPage: number,
    pageSize: number,
  ): IPaginationMetadata {
    const totalPages = Math.ceil(totalRecords / pageSize)

    return {
      totalRecords,
      currentPage,
      totalPages,
      pageSize,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    }
  }

  static createResponse<T>(
    data: T[],
    totalRecords: number,
    currentPage: number,
    pageSize: number,
  ): IPaginatedResponse<T> {
    return {
      data,
      metadata: this.createMetadata(totalRecords, currentPage, pageSize),
    }
  }
}
