import { EntityManager } from 'typeorm'
import {
  SortCategoryDto,
  FilterCategoryDto,
} from '@/modules/categories/dto/query-category.dto'
import { NullableType } from '@/utils/types/nullable.type'
import { DeepPartial } from '@/utils/types/deep-partial.type'
import { Category } from '@/modules/categories/domain/category'
import { IPaginationOptions } from '@/utils/types/pagination-options'

export abstract class CategoryRepository {
  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
    searchOptions,
  }: {
    filterOptions?: FilterCategoryDto | null
    sortOptions?: SortCategoryDto[] | null
    paginationOptions: IPaginationOptions
    searchOptions?: string | null
  }): Promise<{ data: Category[]; totalCount: number; totalRecords: number }>

  abstract findById(id: Category['id']): Promise<NullableType<Category>>

  abstract findByIds(ids: Category['id'][]): Promise<Category[]>

  abstract findByField<K extends keyof Category>(
    field: K,
    value: Category[K],
    options?: { withDeleted?: boolean },
  ): Promise<NullableType<Category>>

  abstract create(
    data: Omit<Category, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
    entityManager: EntityManager,
  ): Promise<Category>

  abstract update(
    id: Category['id'],
    payload: DeepPartial<Category>,
    entityManager: EntityManager,
  ): Promise<Category>

  abstract softDelete(
    id: Category['id'],
    entityManager: EntityManager,
  ): Promise<void>

  abstract restore(
    id: Category['id'],
    entityManager: EntityManager,
  ): Promise<void>

  abstract hardDelete(
    id: Category['id'],
    entityManager: EntityManager,
  ): Promise<void>
}
