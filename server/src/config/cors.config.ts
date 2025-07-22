import { ConfigService } from '@nestjs/config'
import { AllConfigType } from '@/config/config.type'

export const getCorsConfig = (configService: ConfigService<AllConfigType>) => {
  const origins = configService.get('app.cors.origins', { infer: true })
  const allowedHeaders = configService.get('app.cors.allowedHeaders', {
    infer: true,
  })

  return {
    origin: origins ? origins.split(',') : '*',
    allowedHeaders: allowedHeaders
      ? allowedHeaders.split(',')
      : ['Content-Type', 'Authorization'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    credentials: true,
  }
}
