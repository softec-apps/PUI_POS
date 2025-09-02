import { registerAs } from '@nestjs/config'
import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator'
import validateConfig from '@/utils/validate-config'

export type RedisConfig = {
  host: string
  port: number
  password?: string
}

class EnvironmentVariablesValidator {
  @IsString()
  @IsOptional()
  REDIS_HOST: string

  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  REDIS_PORT: number

  @IsString()
  @IsOptional()
  REDIS_PASSWORD: string
}

export default registerAs<RedisConfig>('redis', () => {
  validateConfig(process.env, EnvironmentVariablesValidator)

  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
    password: process.env.REDIS_PASSWORD,
  }
})
