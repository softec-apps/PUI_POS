import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MailService } from '@/modules/mail/mail.service'
import { MailerModule } from '@/modules/mailer/mailer.module'

@Module({
  imports: [ConfigModule, MailerModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
