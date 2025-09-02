import 'dotenv/config'
import path from 'path'
import { AppModule } from '@/app.module'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
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

// Bull Board
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { FastifyAdapter as BullFastifyAdapter } from '@bull-board/fastify'
import { QUEUE } from '@/common/constants/queue.const'
import { getQueueToken } from '@nestjs/bullmq'

async function bootstrap() {
  const adapter = new FastifyAdapter()

  await adapter.register(multipart)
  await adapter.register(fastifyStatic, {
    root: path.resolve('./files'),
    prefix: '/files/',
  })

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  )

  // Bull Board
  const serverAdapter = new BullFastifyAdapter()
  serverAdapter.setBasePath('/admin/queues')

  const { addQueue } = createBullBoard({
    queues: [],
    serverAdapter,
  })

  await app.register(serverAdapter.registerPlugin(), {
    prefix: '/admin/queues',
  })

  configureGlobalAppSettings(app)
  const configService = app.get(ConfigService<AllConfigType>)
  const document = configureSwaggerDocument(app)
  setupSwaggerUI(app, document)

  await app.init()

  // 👇 Obtener TODAS las colas después de inicializar la app
  try {
    // Registrar cola VOUCHER
    const voucherQueue = app.get(getQueueToken(QUEUE.VOUCHER))
    if (voucherQueue) {
      addQueue(new BullMQAdapter(voucherQueue))
      console.log('✅ Cola VOUCHER registrada en Bull Board')
    }
  } catch (error) {
    console.warn('⚠️ No se pudo obtener la cola VOUCHER:', error.message)
  }

  try {
    // Registrar cola WEBHOOK
    const webhookQueue = app.get(getQueueToken(QUEUE.WEBHOOK))
    if (webhookQueue) {
      addQueue(new BullMQAdapter(webhookQueue))
      console.log('✅ Cola WEBHOOK registrada en Bull Board')
    }
  } catch (error) {
    console.warn('⚠️ No se pudo obtener la cola WEBHOOK:', error.message)
  }

  await startApplication(app, configService)
}

void bootstrap()
