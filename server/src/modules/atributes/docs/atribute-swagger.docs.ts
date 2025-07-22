import { CreateCrudApiDocs } from '@/common/decorators/crud-api-docs.decorator'
import { ParamAtributeDto } from '@/modules/atributes/dto/param-atribute.dto'
import { QueryAtributeDto } from '@/modules/atributes/dto/query-atribute.dto'
import { CreateAtributeDto } from '@/modules/atributes/dto/create-atribute.dto'
import { UpdateAtributeDto } from '@/modules/atributes/dto/update-atribute.dto'
import {
  CreateAtributeResponseDto,
  UpdateAtributeResponseDto,
  FindOneAtributeResponseDto,
  FindAllAtributeResponseDto,
  DeleteAtributeResponseDto,
  HardDeleteAtributeResponseDto,
} from '@/modules/atributes/dto/response-atribute.dto'

const docs = CreateCrudApiDocs({
  createDto: CreateAtributeDto,
  updateDto: UpdateAtributeDto,
  responseDto: CreateAtributeResponseDto,
  paramDto: ParamAtributeDto,
  queryDto: QueryAtributeDto,
  requiresAuth: true,
  serializeGroups: ['admin'],
})

export const AtributeApiDocs = {
  create: docs.create({
    summary: 'Create a new atribute',
    description: 'Creates a new atribute. Requires administrator privileges.',
    responseDto: CreateAtributeResponseDto,
    customResponses: {
      badRequest: 'Invalid data provided in the request body.',
      conflict: 'A atribute with the specified name already exists.',
      forbidden: 'Insufficient permissions to create a atribute.',
    },
  }),

  findOne: docs.findOne({
    summary: 'Retrieve atribute by ID',
    description: 'Fetches the details of a specific atribute using its ID.',
    responseDto: FindOneAtributeResponseDto,
    customResponses: {
      notFound: 'The requested atribute does not exist.',
      forbidden: 'Insufficient permissions to view this atribute.',
    },
  }),

  findAll: docs.findAll({
    summary: 'List atributes',
    description:
      'Retrieves a list of atributes with pagination and filtering options.',
    responseDto: FindAllAtributeResponseDto,
  }),

  update: docs.update({
    summary: 'Update atribute',
    description:
      'Updates the data of an existing atribute. Requires administrator privileges.',
    responseDto: UpdateAtributeResponseDto,
    customResponses: {
      badRequest: 'Invalid data provided for updating the atribute.',
      notFound: 'The atribute to update does not exist.',
      conflict: 'The new name is already in use by another atribute.',
      forbidden: 'Insufficient permissions to modify atributes.',
    },
  }),

  delete: docs.delete({
    summary: 'Delete atribute (soft delete)',
    description:
      'Deactivates a atribute (soft delete).  The atribute is not permanently removed from the database. Requires administrator privileges.',
    responseDto: DeleteAtributeResponseDto,
    customResponses: {
      notFound: 'The atribute to delete does not exist.',
      forbidden: 'Insufficient permissions to delete atributes.',
    },
  }),

  hardDelete: docs.hardDelete({
    summary: 'Permanently delete atribute',
    description:
      'Permanently deletes a atribute and all its associated data. This action cannot be undone. Requires super administrator privileges.',
    responseDto: HardDeleteAtributeResponseDto,
    customResponses: {
      notFound: 'The atribute to delete does not exist.',
      forbidden: 'Insufficient permissions to permanently delete atributes.',
    },
  }),
}
