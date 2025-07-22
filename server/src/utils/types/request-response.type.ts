// Tipos de operaciones soportadas
export type ApiOperation = 'create' | 'read' | 'update' | 'delete' | 'list'

/**
 * Detalles estructurados de errores (RFC 7807 inspired).
 */
export interface ApiError {
  message: string // Descripción breve
  details?: Record<string, any> // Contexto adicional (validaciones, traces)
  stack?: string // Solo en desarrollo
}

/**
 * Metadatos comunes a todas las respuestas.
 */
export interface ApiMeta {
  timestamp: Date // Fecha-hora de la respuesta
  resource: string // Ruta del recurso (ej: "/templates/:id")
  method: ApiOperation // Tipo de operación
  [key: string]: any // Extensiones específicas
}

/**
 * Respuesta estándar para todas las operaciones de la API.
 * @template T - Tipo del payload de datos (opcional).
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  statusCode?: number
  message?: string
  data?: T | any
  error?: ApiError
  meta?: ApiMeta
}

/**
 * Respuesta para operaciones CREATE (extensión de ApiResponse)
 * @template T - Tipo del recurso eliminado
 */
export interface DeleteResponse<T = void> extends ApiResponse<T> {
  meta?: ApiMeta & {
    method: 'delete'
  }
}

/**
 * Respuesta para operaciones CREATE (extensión de ApiResponse)
 * @template T - Tipo del recurso creado
 */
export interface CreateResponse<T> extends ApiResponse<T> {
  meta: ApiMeta & {
    method: 'create'
  }
}

/**
 * Respuesta para operaciones UPDATE (extensión de ApiResponse)
 * @template T - Tipo del recurso actualizado
 */
export interface UpdateResponse<T> extends ApiResponse<T> {
  meta: ApiMeta & {
    method: 'update'
  }
}
