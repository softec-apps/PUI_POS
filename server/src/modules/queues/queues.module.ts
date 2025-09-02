// queues.module.ts - Versión COMPLETA corregida
import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { QUEUE } from '@/common/constants/queue.const'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    // ✅ Configuración raíz de BullMQ
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisConfig = {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          maxRetriesPerRequest: null,
          lazyConnect: true,
        }

        console.log('🔧 Configuración Redis:', redisConfig)

        return {
          connection: redisConfig,
          defaultJobOptions: {
            attempts: 5,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: false,
            removeOnFail: false,
          },
        }
      },
      inject: [ConfigService],
    }),

    // ✅ Registro de TODAS las colas de la aplicación
    BullModule.registerQueue(
      {
        name: QUEUE.VOUCHER,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 3000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      },
      {
        name: QUEUE.WEBHOOK,
        defaultJobOptions: {
          attempts: 2,
          backoff: { type: 'fixed', delay: 1000 },
          removeOnComplete: true,
          removeOnFail: false,
        },
      },
    ),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
