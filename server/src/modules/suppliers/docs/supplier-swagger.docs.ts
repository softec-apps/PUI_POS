import { CreateCrudApiDocs } from '@/common/decorators/crud-api-docs.decorator'

import {
  CreateSupplierResponseDto,
  UpdateSupplierResponseDto,
  FindOneSupplierResponseDto,
  FindAllSupplierResponseDto,
  DeleteSupplierResponseDto,
  HardDeleteSupplierResponseDto,
} from '@/modules/suppliers/dto/response-supplier.dto'
import { ParamSupplierDto } from '@/modules/suppliers/dto/param-supplier.dto'
import { QuerySupplierDto } from '@/modules/suppliers/dto/query-supplier.dto'
import { CreateSupplierDto } from '@/modules/suppliers/dto/create-supplier.dto'
import { UpdateSupplierDto } from '@/modules/suppliers/dto/update-supplier.dto'

const crudDocs = CreateCrudApiDocs({
  createDto: CreateSupplierDto,
  updateDto: UpdateSupplierDto,
  responseDto: CreateSupplierResponseDto,
  paramDto: ParamSupplierDto,
  queryDto: QuerySupplierDto,
  requiresAuth: true,
  serializeGroups: ['admin', 'manager'],
})

export const SupplierApiDocs = {
  create: crudDocs.create({
    summary: 'Create a new supplier',
    description:
      'Creates a new supplier. Requires administrator, manager privileges.',
    responseDto: CreateSupplierResponseDto,
    customResponses: {
      badRequest: 'Invalid data provided in the request body.',
      conflict: 'A supplier with the specified name already exists.',
      forbidden: 'Insufficient permissions to create a supplier.',
    },
  }),

  findOne: crudDocs.findOne({
    summary: 'Retrieve supplier by ID',
    description: 'Fetches the details of a specific supplier using its ID.',
    responseDto: FindOneSupplierResponseDto,
    customResponses: {
      notFound: 'The requested supplier does not exist.',
      forbidden: 'Insufficient permissions to view this supplier.',
    },
  }),

  findAll: crudDocs.findAll({
    summary: 'List suppliers',
    description:
      'Retrieves a list of suppliers with pagination and filtering options.',
    responseDto: FindAllSupplierResponseDto,
  }),

  update: crudDocs.update({
    summary: 'Update supplier',
    description:
      'Updates the data of an existing supplier. Requires administrator, manager privileges.',
    responseDto: UpdateSupplierResponseDto,
    customResponses: {
      badRequest: 'Invalid data provided for updating the supplier.',
      notFound: 'The supplier to update does not exist.',
      conflict: 'The new name is already in use by another supplier.',
      forbidden: 'Insufficient permissions to modify suppliers.',
    },
  }),

  delete: crudDocs.delete({
    summary: 'Delete supplier (soft delete)',
    description:
      'Deactivates a supplier (soft delete).  The supplier is not permanently removed from the database. Requires administrator, manager privileges.',
    responseDto: DeleteSupplierResponseDto,
    customResponses: {
      notFound: 'The supplier to delete does not exist.',
      forbidden: 'Insufficient permissions to delete suppliers.',
    },
  }),

  hardDelete: crudDocs.hardDelete({
    summary: 'Permanently delete supplier',
    description:
      'Permanently deletes a supplier and all its associated data. This action cannot be undone. Requires administrator, manager privileges.',
    responseDto: HardDeleteSupplierResponseDto,
    customResponses: {
      notFound: 'The supplier to delete does not exist.',
      forbidden: 'Insufficient permissions to permanently delete suppliers.',
    },
  }),
}
