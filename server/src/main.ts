import 'dotenv/config'

import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'

import { AppModule } from '@/app.module'
import type { AllConfigType } from '@/config/config.type'

import { setupSwaggerUI } from '@/config/swagger-ui.config'
import { startApplication } from '@/config/app-startup.config'
import { configureGlobalAppSettings } from '@/config/app-settings.config'
import { configureSwaggerDocument } from '@/config/swagger-document.config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  })

  // Configuración global de la aplicación
  configureGlobalAppSettings(app)

  const configService = app.get(ConfigService<AllConfigType>)

  // Configuración de Swagger
  const document = configureSwaggerDocument(app)

  // Configuración de UI de Swagger
  setupSwaggerUI(app, document)

  // Iniciar la aplicación
  await startApplication(app, configService)
}

void bootstrap()
