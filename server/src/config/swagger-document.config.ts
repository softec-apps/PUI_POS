import { ConfigService } from '@nestjs/config'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { API_TAGS_CONFIG } from '@/config/swagger-api-tags.config'

export function configureSwaggerDocument(app: any) {
  const configService = app.get(ConfigService)
  const builder = new DocumentBuilder()
    .setTitle(configService.get('app.name', { infer: true }) || 'API')
    .setDescription(
      configService.get('app.description', { infer: true }) ||
        'API Documentation',
    )
    .setVersion(configService.get('app.version', { infer: true }) || '1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })

  // Añadir tags con configuración extendida
  API_TAGS_CONFIG.forEach((tag) => {
    if (tag.externalDocs) {
      builder.addTag(tag.name, tag.description, tag.externalDocs)
    } else {
      builder.addTag(tag.name, tag.description)
    }
  })

  builder.addGlobalParameters({
    in: 'header',
    required: false,
    name: process.env.APP_HEADER_LANGUAGE || 'x-custom-lang',
    schema: { example: 'es' },
  })

  return SwaggerModule.createDocument(app, builder.build())
}
