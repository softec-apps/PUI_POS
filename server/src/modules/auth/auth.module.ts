import { JwtModule } from '@nestjs/jwt'
import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { MailModule } from '@/modules/mail/mail.module'
import { AuthService } from '@/modules/auth/auth.service'
import { UsersModule } from '@/modules/users/users.module'
import { SessionModule } from '@/modules/session/session.module'
import { AuthController } from '@/modules/auth/auth.controller'
import { JwtStrategy } from '@/modules/auth/strategies/jwt.strategy'
import { AnonymousStrategy } from '@/modules/auth/strategies/anonymous.strategy'
import { JwtRefreshStrategy } from '@/modules/auth/strategies/jwt-refresh.strategy'

@Module({
  imports: [
    UsersModule,
    SessionModule,
    PassportModule,
    MailModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, AnonymousStrategy],
  exports: [AuthService],
})
export class AuthModule {}
