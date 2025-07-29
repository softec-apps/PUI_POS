import { docViewers } from '@/utils/docsApi'
import { SwaggerModule } from '@nestjs/swagger'

export function setupSwaggerUI(app: any, document: any) {
  // Obtener la instancia de Fastify
  const fastifyInstance = app.getHttpAdapter().getInstance()

  // ARREGLADO: Registrar ruta JSON usando Fastify directamente
  fastifyInstance.get('/api-json', async (request: any, reply: any) => {
    reply.type('application/json').send(document) // Fastify maneja la serialización automáticamente
  })

  // Swagger UI - funciona correctamente
  SwaggerModule.setup('swagger', app, document, {
    customSiteTitle: 'PUI POS API - SWAGGER',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 20px 0 }
      .opblock-summary { font-weight: 600 }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      defaultModelsExpandDepth: -1,
      defaultModelExpandDepth: 1,
      docExpansion: 'none',
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tryItOutEnabled: true,
      syntaxHighlight: {
        activate: true,
        theme: 'agate',
      },
      operationsSorter: (
        a: { get: (arg0: string) => string },
        b: { get: (arg0: string) => string },
      ) => {
        const methodsOrder = ['get', 'post', 'put', 'delete', 'patch']
        return (
          methodsOrder.indexOf(a.get('method')) -
          methodsOrder.indexOf(b.get('method'))
        )
      },
      tagsSorter: 'alpha',
      validatorUrl: null,
      withCredentials: true,
    },
    explorer: false,
  })

  // ARREGLADO: Registrar visores adicionales usando Fastify directamente
  docViewers.forEach(({ path, html }) => {
    fastifyInstance.get(path, async (request: any, reply: any) => {
      reply.type('text/html').send(html)
    })
  })
}
