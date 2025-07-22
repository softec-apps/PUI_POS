import { docViewers } from '@/utils/docsApi'
import { ConfigService } from '@nestjs/config'
import type { AllConfigType } from '@/config/config.type'

export async function startApplication(
  app: any,
  configService: ConfigService<AllConfigType>,
) {
  await app.listen(configService.getOrThrow('app.port', { infer: true }))
  const nodeEnv = configService.getOrThrow('app.nodeEnv', { infer: true })
  const baseUrl = `${configService.get('app.backendDomain', { infer: true })}`

  console.log(`\n💻 Environment: ${nodeEnv} \n`)
  console.log(`🚀 API running at ${baseUrl}`)
  console.log(`\n📚 API Documentation:`)
  docViewers.forEach(({ path, title }) => {
    console.log(`   - ${title} -> ${baseUrl}${path}`)
  })
  console.log(`   - Swagger UI -> ${baseUrl}/swagger\n`)
}
