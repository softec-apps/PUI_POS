import { ConfigService } from '@nestjs/config'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { AllConfigType } from '@/config/config.type'
import { OrNeverType } from '@/utils/types/or-never.type'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtPayloadType } from '@/modules/auth/strategies/types/jwt-payload.type'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService<AllConfigType>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow('auth.secret', { infer: true }),
    })
  }

  public validate(payload: JwtPayloadType): OrNeverType<JwtPayloadType> {
    if (!payload.id) throw new UnauthorizedException()
    return payload
  }
}
