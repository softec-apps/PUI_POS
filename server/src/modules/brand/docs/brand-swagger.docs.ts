import { ROLES } from '@/common/constants/roles-const'
import { CreateCrudApiDocs } from '@/common/decorators/crud-api-docs.decorator'
import {
  CreateBrandResponseDto,
  UpdateBrandResponseDto,
  FindOneBrandResponseDto,
  FindAllBrandResponseDto,
  SoftDeleteBrandResponseDto,
  HardDeleteBrandResponseDto,
} from '@/modules/brand/dto/response-brand.dto'
import { ParamBrandDto } from '@/modules/brand/dto/param-brand.dto'
import { QueryBrandDto } from '@/modules/brand/dto/query-brand.dto'
import { CreateBrandDto } from '@/modules/brand/dto/create-brand.dto'
import { UpdateBrandDto } from '@/modules/brand/dto/update-brand.dto'

const crudDocs = CreateCrudApiDocs({
  createDto: CreateBrandDto,
  updateDto: UpdateBrandDto,
  responseDto: CreateBrandResponseDto,
  paramDto: ParamBrandDto,
  queryDto: QueryBrandDto,
  requiresAuth: true,
  serializeGroups: [ROLES.ADMIN, ROLES.MANAGER],
})

export const BrandApiDocs = {
  create: crudDocs.create({
    summary: 'Create a new brand',
    description:
      'Creates a new brand. Requires administrator, manager privileges.',
    responseDto: CreateBrandResponseDto,
    customResponses: {
      badRequest: 'Invalid data provided in the request body.',
      conflict: 'A brand with the specified name already exists.',
      forbidden: 'Insufficient permissions to create a brand.',
    },
  }),

  findOne: crudDocs.findOne({
    summary: 'Retrieve brand by ID',
    description: 'Fetches the details of a specific brand using its ID.',
    responseDto: FindOneBrandResponseDto,
    customResponses: {
      notFound: 'The requested brand does not exist.',
      forbidden: 'Insufficient permissions to view this brand.',
    },
  }),

  findAll: crudDocs.findAll({
    summary: 'List brand',
    description:
      'Retrieves a list of brand with pagination and filtering options.',
    responseDto: FindAllBrandResponseDto,
  }),

  update: crudDocs.update({
    summary: 'Update brand',
    description:
      'Updates the data of an existing brand. Requires administrator, manager privileges.',
    responseDto: UpdateBrandResponseDto,
    customResponses: {
      badRequest: 'Invalid data provided for updating the brand.',
      notFound: 'The brand to update does not exist.',
      conflict: 'The new name is already in use by another brand.',
      forbidden: 'Insufficient permissions to modify brand.',
    },
  }),

  delete: crudDocs.delete({
    summary: 'Delete brand (soft delete)',
    description:
      'Deactivates a brand (soft delete).  The brand is not permanently removed from the database. Requires administrator, manager privileges.',
    responseDto: SoftDeleteBrandResponseDto,
    customResponses: {
      notFound: 'The brand to delete does not exist.',
      forbidden: 'Insufficient permissions to delete brand.',
    },
  }),

  hardDelete: crudDocs.hardDelete({
    summary: 'Permanently delete brand',
    description:
      'Permanently deletes a brand and all its associated data. This action cannot be undone. Requires administrator, manager privileges.',
    responseDto: HardDeleteBrandResponseDto,
    customResponses: {
      notFound: 'The brand to delete does not exist.',
      forbidden: 'Insufficient permissions to permanently delete brand.',
    },
  }),
}
