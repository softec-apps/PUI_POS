import { AppConfig } from '@/config/app-config.type'
import { AuthConfig } from '@/modules/auth/config/auth-config.type'
import { MailConfig } from '@/modules/mail/config/mail-config.type'
import { FileConfig } from '@/modules/files/config/file-config.type'
import { DatabaseConfig } from '@/database/config/database-config.type'
import { GoogleConfig } from '@/modules/auth-google/config/google-config.type'

export type AllConfigType = {
  app: AppConfig
  auth: AuthConfig
  database: DatabaseConfig
  file: FileConfig
  google: GoogleConfig
  mail: MailConfig
}
