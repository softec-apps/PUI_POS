import { CreateCrudApiDocs } from '@/common/decorators/crud-api-docs.decorator'
import { ParamUserDto } from '@/modules/users/dto/param-user.dto'
import { QueryUserDto } from '@/modules/users/dto/query-user.dto'
import { CreateUserDto } from '@/modules/users/dto/create-user.dto'
import { UpdateUserDto } from '@/modules/users/dto/update-user.dto'
import {
  CreateUsersResponseDto,
  UpdateUsersResponseDto,
  FindOneUsersResponseDto,
  FindAllUsersResponseDto,
  SoftDeleteUsersResponseDto,
  HardDeleteUsersResponseDto,
} from '@/modules/users/dto/response-user.dto'

const crudDocs = CreateCrudApiDocs({
  createDto: CreateUserDto,
  updateDto: UpdateUserDto,
  responseDto: CreateUsersResponseDto,
  paramDto: ParamUserDto,
  queryDto: QueryUserDto,
  requiresAuth: true,
  serializeGroups: ['admin'],
})

export const UserApiDocs = {
  create: crudDocs.create({
    summary: 'Create a new users',
    description:
      'Creates a new users with the provided details. Requires administrator privileges.',
    responseDto: CreateUsersResponseDto,
    customResponses: {
      badRequest: 'Invalid data provided in the request body.',
      conflict: 'A users with the specified name already exists.',
      forbidden: 'Insufficient permissions to create a users.',
    },
  }),

  findOne: crudDocs.findOne({
    summary: 'Retrieve users by ID',
    description: 'Fetches the details of a specific users using its ID.',
    responseDto: FindOneUsersResponseDto,
    customResponses: {
      notFound: 'The requested users does not exist.',
      forbidden: 'Insufficient permissions to view this users.',
    },
  }),

  findAll: crudDocs.findAll({
    summary: 'List users',
    description:
      'Retrieves a list of users with pagination and filtering options.',
    responseDto: FindAllUsersResponseDto,
  }),

  update: crudDocs.update({
    summary: 'Update users',
    description:
      'Updates the data of an existing users. Requires administrator privileges.',
    responseDto: UpdateUsersResponseDto,
    customResponses: {
      badRequest: 'Invalid data provided for updating the users.',
      notFound: 'The users to update does not exist.',
      conflict: 'The new name is already in use by another users.',
      forbidden: 'Insufficient permissions to modify users.',
    },
  }),

  delete: crudDocs.delete({
    summary: 'Delete users (soft delete)',
    description:
      'Deactivates a users (soft delete).  The users is not permanently removed from the database. Requires administrator privileges.',
    responseDto: SoftDeleteUsersResponseDto,
    customResponses: {
      notFound: 'The users to delete does not exist.',
      forbidden: 'Insufficient permissions to delete users.',
    },
  }),

  hardDelete: crudDocs.hardDelete({
    summary: 'Permanently delete users',
    description:
      'Permanently deletes a users and all its associated data. This action cannot be undone. Requires super administrator privileges.',
    responseDto: HardDeleteUsersResponseDto,
    customResponses: {
      notFound: 'The users to delete does not exist.',
      forbidden: 'Insufficient permissions to permanently delete users.',
    },
  }),
}
