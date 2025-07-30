import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from '@/app.module'
import type { AllConfigType } from '@/config/config.type'
import { setupSwaggerUI } from '@/config/swagger-ui.config'
import { startApplication } from '@/config/app-startup.config'
import { configureGlobalAppSettings } from '@/config/app-settings.config'
import { configureSwaggerDocument } from '@/config/swagger-document.config'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'

// 👇 Importa multipart y static
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import path from 'path'

async function bootstrap() {
  const adapter = new FastifyAdapter({ logger: false })

  // 👇 Registro de multipart
  await adapter.register(multipart)

  // 👇 Registro de static
  await adapter.register(fastifyStatic, {
    root: path.join(__dirname, '..', 'files'), // ruta a tu carpeta de archivos
    prefix: '/files/', // esta será la URL base
  })

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
    { logger: false },
  )

  configureGlobalAppSettings(app)

  const configService = app.get(ConfigService<AllConfigType>)

  const document = configureSwaggerDocument(app)
  setupSwaggerUI(app, document)

  await startApplication(app, configService)
}

void bootstrap()
