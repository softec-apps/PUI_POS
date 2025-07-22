import { Type } from '@nestjs/common'
import {
  GetApiDocs,
  CreateApiDocs,
  DeleteApiDocs,
  UpdateApiDocs,
} from '@/common/decorators/api-docs.decorator'

export interface CrudApiDocsConfig {
  createDto?: Type<any>
  updateDto?: Type<any>
  responseDto?: Type<any>
  paramDto?: Type<any>
  queryDto?: Type<any>
  requiresAuth?: boolean
  serializeGroups?: string[]

  // DTOs específicos por operación
  createResponseDto?: Type<any>
  updateResponseDto?: Type<any>
  findOneResponseDto?: Type<any>
  findAllResponseDto?: Type<any>
  deleteResponseDto?: Type<any>
  hardDeleteResponseDto?: Type<any>
}

export function CreateCrudApiDocs(config: CrudApiDocsConfig) {
  const {
    createDto,
    updateDto,
    responseDto,
    paramDto,
    queryDto,
    requiresAuth = true,
    serializeGroups,
    createResponseDto,
    updateResponseDto,
    findOneResponseDto,
    findAllResponseDto,
    deleteResponseDto,
    hardDeleteResponseDto,
  } = config

  return {
    create: (options?: {
      summary?: string
      description?: string
      responseDto?: Type<any>
      customResponses?: {
        badRequest?: string
        conflict?: string
        forbidden?: string
      }
    }) =>
      CreateApiDocs({
        summary: options?.summary || 'Create resource',
        description: options?.description || 'Create a new resource',
        requiresAuth,
        bodyDto: createDto,
        responseDto: options?.responseDto || createResponseDto || responseDto,
        serializeGroups,
        customResponses: options?.customResponses,
      }),

    findOne: (options?: {
      summary?: string
      description?: string
      responseDto?: Type<any>
      customResponses?: {
        notFound?: string
        forbidden?: string
      }
    }) =>
      GetApiDocs({
        summary: options?.summary || 'Get resource by ID',
        description:
          options?.description || 'Get a specific resource by its ID',
        requiresAuth,
        responseDto: options?.responseDto || findOneResponseDto || responseDto,
        paramDto,
        serializeGroups,
        customResponses: options?.customResponses,
      }),

    findAll: (options?: {
      summary?: string
      description?: string
      responseDto?: Type<any>
    }) =>
      GetApiDocs({
        summary: options?.summary || 'List resources',
        description:
          options?.description || 'Get list of resources with optional filters',
        requiresAuth,
        responseDto: options?.responseDto || findAllResponseDto || responseDto,
        queryDto,
        serializeGroups,
      }),

    update: (options?: {
      summary?: string
      description?: string
      responseDto?: Type<any>
      customResponses?: {
        badRequest?: string
        notFound?: string
        conflict?: string
        forbidden?: string
      }
    }) =>
      UpdateApiDocs({
        summary: options?.summary || 'Update resource',
        description: options?.description || 'Update an existing resource',
        requiresAuth,
        bodyDto: updateDto,
        responseDto: options?.responseDto || updateResponseDto || responseDto,
        paramDto,
        serializeGroups,
        customResponses: options?.customResponses,
      }),

    delete: (options?: {
      summary?: string
      description?: string
      responseDto?: Type<any>
      customResponses?: {
        notFound?: string
        forbidden?: string
      }
    }) =>
      DeleteApiDocs({
        summary: options?.summary || 'Delete resource',
        description: options?.description || 'Delete a resource (soft delete)',
        requiresAuth,
        paramDto,
        responseDto: options?.responseDto || deleteResponseDto || responseDto,
        serializeGroups,
        customResponses: options?.customResponses,
      }),

    hardDelete: (options?: {
      summary?: string
      description?: string
      responseDto?: Type<any>
      customResponses?: {
        notFound?: string
        forbidden?: string
      }
    }) =>
      DeleteApiDocs({
        summary: options?.summary || 'Delete resource permanently',
        description:
          options?.description ||
          'Permanently delete a resource. This action cannot be undone',
        requiresAuth,
        paramDto,
        responseDto:
          options?.responseDto || hardDeleteResponseDto || responseDto,
        serializeGroups: serializeGroups || ['admin'],
        customResponses: options?.customResponses,
      }),
  }
}
