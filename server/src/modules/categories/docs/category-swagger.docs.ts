import { CreateCrudApiDocs } from '@/common/decorators/crud-api-docs.decorator'
import { ParamCategoryDto } from '@/modules/categories/dto/param-category.dto'
import { QueryCategoryDto } from '@/modules/categories/dto/query-category.dto'
import { CreateCategoryDto } from '@/modules/categories/dto/create-category.dto'
import { UpdateCategoryDto } from '@/modules/categories/dto/update-category.dto'
import {
  CreateCategoryResponseDto,
  UpdateCategoryResponseDto,
  FindOneCategoryResponseDto,
  FindAllCategoryResponseDto,
  DeleteCategoryResponseDto,
  HardDeleteCategoryResponseDto,
} from '@/modules/categories/dto/response-category.dto'

const categoryCrudDocs = CreateCrudApiDocs({
  createDto: CreateCategoryDto,
  updateDto: UpdateCategoryDto,
  responseDto: CreateCategoryResponseDto,
  paramDto: ParamCategoryDto,
  queryDto: QueryCategoryDto,
  requiresAuth: true,
  serializeGroups: ['admin'],
})

export const CategoryApiDocs = {
  create: categoryCrudDocs.create({
    summary: 'Create a new category',
    description:
      'Creates a new category with the provided details. Requires administrator privileges.',
    responseDto: CreateCategoryResponseDto,
    customResponses: {
      badRequest: 'Invalid data provided in the request body.',
      conflict: 'A category with the specified name already exists.',
      forbidden: 'Insufficient permissions to create a category.',
    },
  }),

  findOne: categoryCrudDocs.findOne({
    summary: 'Retrieve category by ID',
    description: 'Fetches the details of a specific category using its ID.',
    responseDto: FindOneCategoryResponseDto,
    customResponses: {
      notFound: 'The requested category does not exist.',
      forbidden: 'Insufficient permissions to view this category.',
    },
  }),

  findAll: categoryCrudDocs.findAll({
    summary: 'List categories',
    description:
      'Retrieves a list of categories with pagination and filtering options.',
    responseDto: FindAllCategoryResponseDto,
  }),

  update: categoryCrudDocs.update({
    summary: 'Update category',
    description:
      'Updates the data of an existing category. Requires administrator privileges.',
    responseDto: UpdateCategoryResponseDto,
    customResponses: {
      badRequest: 'Invalid data provided for updating the category.',
      notFound: 'The category to update does not exist.',
      conflict: 'The new name is already in use by another category.',
      forbidden: 'Insufficient permissions to modify categories.',
    },
  }),

  delete: categoryCrudDocs.delete({
    summary: 'Delete category (soft delete)',
    description:
      'Deactivates a category (soft delete).  The category is not permanently removed from the database. Requires administrator privileges.',
    responseDto: DeleteCategoryResponseDto,
    customResponses: {
      notFound: 'The category to delete does not exist.',
      forbidden: 'Insufficient permissions to delete categories.',
    },
  }),

  hardDelete: categoryCrudDocs.hardDelete({
    summary: 'Permanently delete category',
    description:
      'Permanently deletes a category and all its associated data. This action cannot be undone. Requires super administrator privileges.',
    responseDto: HardDeleteCategoryResponseDto,
    customResponses: {
      notFound: 'The category to delete does not exist.',
      forbidden: 'Insufficient permissions to permanently delete categories.',
    },
  }),
}
