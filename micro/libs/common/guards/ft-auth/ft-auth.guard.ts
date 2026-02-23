import { Injectable, Scope } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FtAuthGuard extends AuthGuard('42'){
  getAuthenticateOptions(){
    return { session: false};
  }
}
