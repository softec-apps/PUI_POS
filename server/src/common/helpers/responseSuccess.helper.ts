import { HttpStatus } from '@nestjs/common'

export type ApiResource = string
export type ApiOperation = 'create' | 'read' | 'update' | 'delete' | 'list'

interface ApiMeta {
  timestamp: Date
  resource: ApiResource
  method: ApiOperation
}

export interface CreateResponse<T = any> {
  success: boolean
  statusCode: HttpStatus.CREATED
  message: string
  data?: T
  meta: ApiMeta & { method: 'create' }
}

export interface ReadResponse<T = any> {
  success: boolean
  statusCode: HttpStatus.OK
  message: string
  data?: T
  meta: ApiMeta & { method: 'read' }
}

export interface UpdateResponse<T = any> {
  success: boolean
  statusCode: HttpStatus.OK
  message: string
  data?: T
  meta: ApiMeta & { method: 'update' }
}

export interface DeleteResponse {
  success: boolean
  statusCode: HttpStatus.OK
  message: string
  meta?: ApiMeta & { method: 'delete' }
}

export interface ListResponse<T = any> {
  success: boolean
  statusCode: HttpStatus.OK
  message: string
  data?: T[]
  meta: ApiMeta & { method: 'list' }
}

interface HttpMethod<T = any> {
  resource: string
  message: string
  data?: T
}

interface ListOptions<T = any> {
  resource: string
  message: string
  data?: T[] | any
}

export function createdResponse<T = any>(
  options: HttpMethod<T>,
): CreateResponse<T> {
  return {
    success: true,
    statusCode: HttpStatus.CREATED,
    message: options.message,
    ...(options.data && { data: options.data }),
    meta: {
      timestamp: new Date(),
      resource: options.resource,
      method: 'create',
    },
  }
}

export function readResponse<T = any>(options: HttpMethod<T>): ReadResponse<T> {
  if (!options.data) throw new Error('Data is required for read response')

  return {
    success: true,
    statusCode: HttpStatus.OK,
    message: options.message,
    data: options.data,
    meta: {
      timestamp: new Date(),
      resource: options.resource,
      method: 'read',
    },
  }
}

export function updatedResponse<T = any>(
  options: HttpMethod<T>,
): UpdateResponse<T> {
  return {
    success: true,
    statusCode: HttpStatus.OK,
    message: options.message,
    ...(options.data && { data: options.data }),
    meta: {
      timestamp: new Date(),
      resource: options.resource,
      method: 'update',
    },
  }
}

export function deletedResponse(options: HttpMethod): DeleteResponse {
  return {
    success: true,
    statusCode: HttpStatus.OK,
    message: options.message,
    meta: {
      timestamp: new Date(),
      resource: options.resource,
      method: 'delete',
    },
  }
}

export function listResponse<T = any>(
  options: ListOptions<T>,
): ListResponse<T> {
  return {
    success: true,
    statusCode: HttpStatus.OK,
    message: options.message,
    data: options.data,
    meta: {
      timestamp: new Date(),
      resource: options.resource,
      method: 'list',
    },
  }
}
