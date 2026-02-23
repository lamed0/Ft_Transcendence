import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import ftOauthConfig from '../config/ft-oauth.config';
import type { ConfigType } from '@nestjs/config';
import { FtDto } from '../dto/ft.dto';

const FortyTwo = require('passport-42');
const FortyTwoStrategy = FortyTwo.Strategy || FortyTwo;

@Injectable()
export class FtStrategy extends PassportStrategy(FortyTwoStrategy, '42') {
  constructor(
    @Inject(ftOauthConfig.KEY) private cfg: ConfigType<typeof ftOauthConfig>,
  ) {
    super({
      clientID: cfg.clientID,
      clientSecret: cfg.clientSecret,
      callbackURL: cfg.callbackUrl,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const raw = profile?._json;
    
    if (!raw) {
      throw new Error('No profile data received from 42');
    }

    const ftUser: FtDto = {
      email: raw?.email || `${raw?.login}@42.fr`, // Fallback email
      login: raw?.login,
      firstName: raw?.first_name,
      lastName: raw?.last_name,
      avatarUrl: raw?.image?.link,
      ftId: raw?.id,
    };

    return ftUser;
  }
}
