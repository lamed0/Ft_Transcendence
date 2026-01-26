import ftOauthConfig from '../config/ft-oauth.config';
import type { ConfigType } from '@nestjs/config';
import { FtDto } from '../dto/ft.dto';
declare const FtStrategy_base: new (...args: unknown[]) => any;
export declare class FtStrategy extends FtStrategy_base {
    private cfg;
    constructor(cfg: ConfigType<typeof ftOauthConfig>);
    validate(accessToken: string, refreshToken: string, profile: any): Promise<FtDto>;
}
export {};
