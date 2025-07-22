import { useContainer } from 'class-validator'
import {
  ValidationPipe,
  VersioningType,
  ClassSerializerInterceptor,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Reflector } from '@nestjs/core'

import { AppModule } from '@/app.module'
import { getCorsConfig } from '@/config/cors.config'

import { morganLogger } from '@/utils/morganLogger.util'
import validationOptions from '@/utils/validation-options'
import { ResolvePromisesInterceptor } from '@/utils/serializer.interceptor'

import { UnifiedResException } from '@/common/interceptors/res.interceptor'
import { CustomValidationPipe } from '@/common/pipes/custom-validation.pipe'
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor'

export function configureGlobalAppSettings(app: any) {
  app.useGlobalPipes(new CustomValidationPipe())
  app.useGlobalFilters(new UnifiedResException())
  app.useGlobalInterceptors(new LoggingInterceptor())

  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  app.use(morganLogger)
  app.enableShutdownHooks()
  app.enableCors(getCorsConfig(app.get(ConfigService)))
  app.setGlobalPrefix(
    app.get(ConfigService).getOrThrow('app.apiPrefix', { infer: true }),
    { exclude: ['/'] },
  )
  app.enableVersioning({ type: VersioningType.URI })
  app.useGlobalPipes(new ValidationPipe(validationOptions))
  app.useGlobalInterceptors(
    new ResolvePromisesInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  )
}
