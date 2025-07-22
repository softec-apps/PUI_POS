import {
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiUnprocessableEntityResponse,
  ApiOkResponse,
} from '@nestjs/swagger'
import {
  NotFoundResponseDto,
  ConflictResponseDto,
  ForbiddenResponseDto,
  BadRequestResponseDto,
  UnauthorizedResponseDto,
  UnprocessableEntityResponseDto,
  InternalServerErrorResponseDto,
} from '@/utils/dto/responseError.dto'
import {
  OkResponseDto,
  CreatedResponseDto,
} from '@/utils/dto/responseSuccess.dto'
import { applyDecorators, SerializeOptions, Type } from '@nestjs/common'

export interface ApiDocsConfig {
  summary: string
  description?: string
  requiresAuth?: boolean
  bodyDto?: Type<any>
  responseDto?: Type<any>
  paramDto?: Type<any>
  queryDto?: Type<any>
  consumes?: string
  serializeGroups?: string[]
  customResponses?: {
    badRequest?: string
    unauthorized?: string
    forbidden?: string
    notFound?: string
    conflict?: string
    unprocessableEntity?: string
    internalServerError?: string
  }
}

export function CreateApiDocs(config: ApiDocsConfig) {
  const {
    summary,
    description,
    requiresAuth = true,
    bodyDto,
    responseDto,
    paramDto,
    queryDto,
    consumes = 'application/json',
    serializeGroups,
    customResponses = {},
  } = config

  const decorators: any[] = [ApiOperation({ summary, description })]

  if (requiresAuth) decorators.push(ApiBearerAuth())
  if (consumes) decorators.push(ApiConsumes(consumes))
  if (bodyDto) decorators.push(ApiBody({ type: bodyDto }))

  // ✅ CORRECCIÓN: Solo usar ApiParam si paramDto está definido (sin duplicación)
  if (paramDto) decorators.push(ApiParam({ name: 'id', type: paramDto }))

  // ✅ CORRECCIÓN: Para queryDto, usar manualmente los parámetros para evitar duplicación
  if (queryDto) {
    decorators.push(
      ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number for pagination',
        example: 1,
      }),
      ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page',
        example: 10,
      }),
      ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Search term for filtering',
      }),
      ApiQuery({
        name: 'filters',
        required: false,
        type: String,
        description: 'Additional filters in JSON format',
        example: '{"status":"active"}',
      }),
      ApiQuery({
        name: 'sort',
        required: false,
        type: String,
        description: 'Sort configuration in JSON format',
        example: '[{"orderBy":"name","order":"asc"}]',
      }),
    )
  }

  // Success responses
  decorators.push(
    ApiCreatedResponse({
      description: 'Successful operation',
      type: responseDto || CreatedResponseDto,
    }),
  )

  // Error responses
  decorators.push(
    ApiBadRequestResponse({
      description: customResponses.badRequest || 'Invalid input data',
      type: BadRequestResponseDto,
    }),
    ApiUnauthorizedResponse({
      description:
        customResponses.unauthorized || 'Authentication token required',
      type: UnauthorizedResponseDto,
    }),
    ApiForbiddenResponse({
      description: customResponses.forbidden || 'No permits for this operation',
      type: ForbiddenResponseDto,
    }),
    ApiNotFoundResponse({
      description: customResponses.notFound || 'Resource not found',
      type: NotFoundResponseDto,
    }),
    ApiConflictResponse({
      description:
        customResponses.conflict || 'Conflict when processing the request',
      type: ConflictResponseDto,
    }),
    ApiUnprocessableEntityResponse({
      description:
        customResponses.unprocessableEntity || 'Non-processable entity',
      type: UnprocessableEntityResponseDto,
    }),
    ApiInternalServerErrorResponse({
      description:
        customResponses.internalServerError || 'Internal Server Error',
      type: InternalServerErrorResponseDto,
    }),
  )

  if (serializeGroups)
    decorators.push(SerializeOptions({ groups: serializeGroups }))

  return applyDecorators(...decorators)
}

export function GetApiDocs(config: Omit<ApiDocsConfig, 'bodyDto'>) {
  const decorators: any[] = [
    ApiOperation({
      summary: config.summary,
      description: config.description,
    }),
  ]

  if (config.requiresAuth) decorators.push(ApiBearerAuth())

  // ✅ CORRECCIÓN: NO usar ApiParam aquí, el paramDto ya define el parámetro
  // Esto evita la duplicación del parámetro 'id'

  // ✅ CORRECCIÓN: Para queryDto, definir manualmente los query parameters
  if (config.queryDto) {
    decorators.push(
      ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number for pagination',
        example: 1,
      }),
      ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Number of items per page',
        example: 10,
      }),
      ApiQuery({
        name: 'search',
        required: false,
        type: String,
        description: 'Search term for filtering',
      }),
      ApiQuery({
        name: 'filters',
        required: false,
        type: String,
        description: 'Additional filters in JSON format',
        example: '{"status":"active"}',
      }),
      ApiQuery({
        name: 'sort',
        required: false,
        type: String,
        description: 'Sort configuration in JSON format',
        example: '[{"orderBy":"name","order":"asc"}]',
      }),
    )
  }

  // Success response
  decorators.push(
    ApiOkResponse({
      description: 'Successful operation',
      type: config.responseDto || OkResponseDto,
    }),
  )

  // Solo incluir los errores relevantes para GET
  decorators.push(
    ApiBadRequestResponse({
      description: config.customResponses?.badRequest || 'Invalid input data',
      type: BadRequestResponseDto,
    }),
    ApiUnauthorizedResponse({
      description:
        config.customResponses?.unauthorized || 'Authentication token required',
      type: UnauthorizedResponseDto,
    }),
    ApiForbiddenResponse({
      description:
        config.customResponses?.forbidden || 'No permits for this operation',
      type: ForbiddenResponseDto,
    }),
    ApiNotFoundResponse({
      description: config.customResponses?.notFound || 'Resource not found',
      type: NotFoundResponseDto,
    }),
    ApiInternalServerErrorResponse({
      description:
        config.customResponses?.internalServerError ||
        'Error interno del servidor',
      type: InternalServerErrorResponseDto,
    }),
  )

  if (config.serializeGroups)
    decorators.push(SerializeOptions({ groups: config.serializeGroups }))

  return applyDecorators(...decorators)
}

export function UpdateApiDocs(config: ApiDocsConfig) {
  const decorators: any[] = [
    ApiOperation({
      summary: config.summary,
      description: config.description,
    }),
  ]

  if (config.requiresAuth) decorators.push(ApiBearerAuth())
  if (config.bodyDto) decorators.push(ApiBody({ type: config.bodyDto }))

  // ✅ CORRECCIÓN: NO usar ApiParam aquí, el paramDto ya define el parámetro
  // Esto evita la duplicación del parámetro 'id'

  // Success response - usar ApiOkResponse para PUT
  decorators.push(
    ApiOkResponse({
      description: 'Successful operation',
      type: config.responseDto || OkResponseDto,
    }),
  )

  // Error responses (igual que antes)
  decorators.push(
    ApiBadRequestResponse({
      description: config.customResponses?.badRequest || 'Invalid input data',
      type: BadRequestResponseDto,
    }),
    ApiUnauthorizedResponse({
      description:
        config.customResponses?.unauthorized || 'Authentication token required',
      type: UnauthorizedResponseDto,
    }),
    ApiForbiddenResponse({
      description:
        config.customResponses?.forbidden || 'No permits for this operation',
      type: ForbiddenResponseDto,
    }),
    ApiNotFoundResponse({
      description: config.customResponses?.notFound || 'Resource not found',
      type: NotFoundResponseDto,
    }),
    ApiConflictResponse({
      description:
        config.customResponses?.conflict ||
        'Conflicto al procesar la solicitud',
      type: ConflictResponseDto,
    }),
    ApiUnprocessableEntityResponse({
      description:
        config.customResponses?.unprocessableEntity || 'Entidad no procesable',
      type: UnprocessableEntityResponseDto,
    }),
    ApiInternalServerErrorResponse({
      description:
        config.customResponses?.internalServerError ||
        'Error interno del servidor',
      type: InternalServerErrorResponseDto,
    }),
  )

  if (config.serializeGroups)
    decorators.push(SerializeOptions({ groups: config.serializeGroups }))

  return applyDecorators(...decorators)
}

export function DeleteApiDocs(config: Omit<ApiDocsConfig, 'bodyDto'>) {
  const decorators: any[] = [
    ApiOperation({
      summary: config.summary,
      description: config.description,
    }),
  ]

  if (config.requiresAuth) decorators.push(ApiBearerAuth())

  // ✅ CORRECCIÓN: NO usar ApiParam aquí, el paramDto ya define el parámetro
  // Esto evita la duplicación del parámetro 'id'

  // Success response
  decorators.push(
    ApiOkResponse({
      description: 'Successful operation',
      type: config.responseDto || OkResponseDto,
    }),
  )

  // Error responses
  decorators.push(
    ApiUnauthorizedResponse({
      description:
        config.customResponses?.unauthorized || 'Authentication token required',
      type: UnauthorizedResponseDto,
    }),
    ApiForbiddenResponse({
      description:
        config.customResponses?.forbidden || 'No permits for this operation',
      type: ForbiddenResponseDto,
    }),
    ApiNotFoundResponse({
      description: config.customResponses?.notFound || 'Resource not found',
      type: NotFoundResponseDto,
    }),
    ApiInternalServerErrorResponse({
      description:
        config.customResponses?.internalServerError ||
        'Error interno del servidor',
      type: InternalServerErrorResponseDto,
    }),
  )

  if (config.serializeGroups)
    decorators.push(SerializeOptions({ groups: config.serializeGroups }))

  return applyDecorators(...decorators)
}
