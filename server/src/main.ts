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
import multipart from '@fastify/multipart'
import fastifyStatic from '@fastify/static'
import path from 'path'
import * as fs from 'fs'

async function bootstrap() {
  const adapter = new FastifyAdapter({ logger: false })

  // 👇 Registro de multipart
  await adapter.register(multipart)

  // 👇 Registro de static - CORREGIDO: usar ruta absoluta consistente
  const staticPath = path.resolve('./files')
  console.log('=== MAIN.TS DEBUG ===')
  console.log('Static files path:', staticPath)
  console.log('Static files exists:', fs.existsSync(staticPath))

  await adapter.register(fastifyStatic, {
    root: staticPath,
    prefix: '/files/',
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
