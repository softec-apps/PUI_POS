import { ROLES } from '@/common/constants/roles-const'
import { CreateCrudApiDocs } from '@/common/decorators/crud-api-docs.decorator'
import {
  ResponseEstablishmentDto,
  UpdateEstablishmentResponseDto,
  FindOneEstablishmentResponseDto,
  FindAllEstablishmentResponseDto,
  CreateEstablishmentResponseDto,
} from '@/modules/establishment/dto/response-establishment.dto'
import { ParamEstablishmentDto } from '@/modules/establishment/dto/param-establishment.dto'
import { QueryEstablishmentDto } from '@/modules/establishment/dto/query-establishment.dto'
import { CreateEstablishmentDto } from '@/modules/establishment/dto/create-establishment.dto'
import { UpdateEstablishmentDto } from '@/modules/establishment/dto/update-establishment.dto'

const crudDocs = CreateCrudApiDocs({
  createDto: CreateEstablishmentDto,
  updateDto: UpdateEstablishmentDto,
  responseDto: ResponseEstablishmentDto,
  paramDto: ParamEstablishmentDto,
  queryDto: QueryEstablishmentDto,
  requiresAuth: true,
  serializeGroups: [ROLES.ADMIN, ROLES.MANAGER],
})

export const EstablishmentApiDocs = {
  create: crudDocs.create({
    summary: 'Create a new establishment',
    description:
      'Creates a new establishment. Requires administrator, manager privileges.',
    responseDto: CreateEstablishmentResponseDto,
    customResponses: {
      badRequest: 'Invalid data provided in the request body.',
      conflict: 'A establishment with the specified name already exists.',
      forbidden: 'Insufficient permissions to create a establishment.',
    },
  }),

  findOne: crudDocs.findOne({
    summary: 'Retrieve establishment by ID',
    description:
      'Fetches the details of a specific establishment using its ID.',
    responseDto: FindOneEstablishmentResponseDto,
    customResponses: {
      notFound: 'The requested establishment does not exist.',
      forbidden: 'Insufficient permissions to view this establishment.',
    },
  }),

  findAll: crudDocs.findAll({
    summary: 'List establishment',
    description:
      'Retrieves a list of establishment with pagination and filtering options.',
    responseDto: FindAllEstablishmentResponseDto,
  }),

  update: crudDocs.update({
    summary: 'Update establishment',
    description:
      'Updates the data of an existing establishment. Requires administrator, manager privileges.',
    responseDto: UpdateEstablishmentResponseDto,
    customResponses: {
      badRequest: 'Invalid data provided for updating the establishment.',
      notFound: 'The establishment to update does not exist.',
      conflict: 'The new name is already in use by another establishment.',
      forbidden: 'Insufficient permissions to modify establishment.',
    },
  }),
}
