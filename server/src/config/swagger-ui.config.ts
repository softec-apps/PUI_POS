import { docViewers } from '@/utils/docsApi'
import { SwaggerModule } from '@nestjs/swagger'
import type { Request, Response } from 'express'

export function setupSwaggerUI(app: any, document: any) {
  app.use('/api-json', (req: Request, res: Response) => res.json(document))

  // Minimal Swagger UI con más opciones
  SwaggerModule.setup('swagger', app, document, {
    customSiteTitle: 'PUI POS API - SWAGGER', // Título personalizado
    customCss: `
    .swagger-ui .topbar { display: none }  /* Oculta la barra superior */
    .swagger-ui .info { margin: 20px 0 }  /* Ajusta márgenes */
    .opblock-summary { font-weight: 600 }  /* Texto más legible */
  `,
    swaggerOptions: {
      persistAuthorization: true, // Persiste el token en localStorage
      displayRequestDuration: true, // Muestra el tiempo de respuesta
      defaultModelsExpandDepth: -1, // Oculta los modelos por defecto
      defaultModelExpandDepth: 1, // Expande solo 1 nivel de schemas
      docExpansion: 'none', // Colapsa todos los endpoints inicialmente
      filter: true, // Habilita el buscador
      showExtensions: true, // Muestra extensiones (x-*)
      showCommonExtensions: true, // Muestra extensiones comunes
      tryItOutEnabled: true, // Habilita el botón "Try it out"
      syntaxHighlight: {
        activate: true, // Resaltado de sintaxis
        theme: 'agate', // Tema del resaltado
      },
      operationsSorter: (
        a: { get: (arg0: string) => string },
        b: { get: (arg0: string) => string },
      ) => {
        // Ordena endpoints por método HTTP
        const methodsOrder = ['get', 'post', 'put', 'delete', 'patch']
        return (
          methodsOrder.indexOf(a.get('method')) -
          methodsOrder.indexOf(b.get('method'))
        )
      },
      tagsSorter: 'alpha', // Ordena tags alfabéticamente
      validatorUrl: null, // Desactiva validación externa
      withCredentials: true, // Permite enviar cookies en CORS
    },
    explorer: false, // Desactiva el explorador (para UI más limpia)
  })

  // Registrar visores de documentación adicionales
  docViewers.forEach(({ path, html }) => {
    app.use(path, (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'text/html')
      res.send(html)
    })
  })
}
