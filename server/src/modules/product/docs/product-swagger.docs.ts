import { ROLES } from '@/common/constants/roles-const'
import { CreateCrudApiDocs } from '@/common/decorators/crud-api-docs.decorator'
import {
  ResponseProductDto,
  UpdateProductResponseDto,
  FindOneProductResponseDto,
  FindAllProductResponseDto,
  SoftDeleteProductResponseDto,
  HardDeleteProductResponseDto,
  CreateProductResponseDto,
} from '@/modules/product/dto/response-product.dto'
import { ParamProductDto } from '@/modules/product/dto/param-product.dto'
import { QueryProductDto } from '@/modules/product/dto/query-product.dto'
import { CreateProductDto } from '@/modules/product/dto/create-product.dto'
import { UpdateProductDto } from '@/modules/product/dto/update-product.dto'

const crudDocs = CreateCrudApiDocs({
  createDto: CreateProductDto,
  updateDto: UpdateProductDto,
  responseDto: ResponseProductDto,
  paramDto: ParamProductDto,
  queryDto: QueryProductDto,
  requiresAuth: true,
  serializeGroups: [ROLES.ADMIN, ROLES.MANAGER],
})

export const ProductApiDocs = {
  create: crudDocs.create({
    summary: 'Create a new product',
    description:
      'Creates a new product. Requires administrator, manager privileges.',
    responseDto: CreateProductResponseDto,
    customResponses: {
      badRequest: 'Invalid data provided in the request body.',
      conflict: 'A product with the specified name already exists.',
      forbidden: 'Insufficient permissions to create a product.',
    },
  }),

  findOne: crudDocs.findOne({
    summary: 'Retrieve product by ID',
    description: 'Fetches the details of a specific product using its ID.',
    responseDto: FindOneProductResponseDto,
    customResponses: {
      notFound: 'The requested product does not exist.',
      forbidden: 'Insufficient permissions to view this product.',
    },
  }),

  findAll: crudDocs.findAll({
    summary: 'List product',
    description:
      'Retrieves a list of product with pagination and filtering options.',
    responseDto: FindAllProductResponseDto,
  }),

  update: crudDocs.update({
    summary: 'Update product',
    description:
      'Updates the data of an existing product. Requires administrator, manager privileges.',
    responseDto: UpdateProductResponseDto,
    customResponses: {
      badRequest: 'Invalid data provided for updating the product.',
      notFound: 'The product to update does not exist.',
      conflict: 'The new name is already in use by another product.',
      forbidden: 'Insufficient permissions to modify product.',
    },
  }),

  delete: crudDocs.delete({
    summary: 'Delete product (soft delete)',
    description:
      'Deactivates a product (soft delete).  The product is not permanently removed from the database. Requires administrator, manager privileges.',
    responseDto: SoftDeleteProductResponseDto,
    customResponses: {
      notFound: 'The product to delete does not exist.',
      forbidden: 'Insufficient permissions to delete product.',
    },
  }),

  hardDelete: crudDocs.hardDelete({
    summary: 'Permanently delete product',
    description:
      'Permanently deletes a product and all its associated data. This action cannot be undone. Requires administrator, manager privileges.',
    responseDto: HardDeleteProductResponseDto,
    customResponses: {
      notFound: 'The product to delete does not exist.',
      forbidden: 'Insufficient permissions to permanently delete product.',
    },
  }),
}
