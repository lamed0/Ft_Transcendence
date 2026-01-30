import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google'){
  getAuthenticateOptions() {
    return { session: false, scope: ['email', 'profile'] };
  }
}