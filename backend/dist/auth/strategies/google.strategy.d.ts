import { Strategy, VerifyCallback } from "passport-google-oauth20";
import googleOauthConfig from "../config/google-oauth.config";
import type { ConfigType } from "@nestjs/config";
import { AuthService } from "../auth.service";
declare const GoogleStrategy_base: new (...args: [options: import("passport-google-oauth20").StrategyOptionsWithRequest] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptions] | [options: import("passport-google-oauth20").StrategyOptionsWithRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class GoogleStrategy extends GoogleStrategy_base {
    private googleConfiguration;
    private authService;
    constructor(googleConfiguration: ConfigType<typeof googleOauthConfig>, authService: AuthService);
    validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<void>;
}
export {};
