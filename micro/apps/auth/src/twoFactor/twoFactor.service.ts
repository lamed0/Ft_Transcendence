import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { ConfigService } from '@nestjs/config';
import { toDataURL } from 'qrcode';

@Injectable()
export class TwoFactorAuthenticationService {
  private authenticator;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService
  ) {
    const lib = require('otplib');

    if (lib.authenticator) {
      this.authenticator = lib.authenticator;
    } else if (lib.default && lib.default.authenticator) {
      this.authenticator = lib.default.authenticator;
    } else {
      this.authenticator = lib.default || lib;
    }
  }

  public async generateTwoFactorAuthenticationSecret(user: { email: string; id: number }) {
    if (!this.authenticator) {
      throw new InternalServerErrorException('2FA Library failed to load');
    }

    const secret = this.authenticator.generateSecret();

    const appName = 'ft_transcendence';
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(appName)}:${encodeURIComponent(user.email)}?secret=${secret}&issuer=${encodeURIComponent(appName)}&algorithm=SHA1&digits=6&period=30`;

    await this.usersService.setTwoFactorAuthenticationSecret(secret, user.id);

    return {
      secret,
      otpauthUrl
    };
  }

  public async generateQrCodeDataURL(otpauthUrl: string) {
    return toDataURL(otpauthUrl);
  }

  public isTwoFactorCodeValid(twoFactorCode: string, user: { twoFactorAuthenticationSecret: string }) {
    if (!this.authenticator) {
      throw new InternalServerErrorException('2FA Library failed to load');
    }

    if (typeof this.authenticator.verify === 'function') {
      return this.authenticator.verify({
        token: twoFactorCode,
        secret: user.twoFactorAuthenticationSecret,
      });
    } else if (typeof this.authenticator.check === 'function') {
      return this.authenticator.check(twoFactorCode, user.twoFactorAuthenticationSecret);
    } else {
      throw new InternalServerErrorException('2FA Verify method not found');
    }
  }
}