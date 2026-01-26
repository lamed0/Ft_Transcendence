import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import googleOauthConfig from "../config/google-oauth.config";
import type { ConfigType } from "@nestjs/config";
import { GoogleDto } from "../dto/google.dto";
import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google'){
    constructor(
        @Inject(googleOauthConfig.KEY) private googleConfiguration: ConfigType<typeof googleOauthConfig>,
        private authService: AuthService,
    ){
        super({
            clientID: googleConfiguration.clientID!,
            clientSecret: googleConfiguration.clientSecret!,
            callbackURL: googleConfiguration.callbackUrl!,
            scope: ['email', 'profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ) {
        
        if (!profile) {
            return done(new Error('No profile received from Google'), false);
        }

        const googleUser: GoogleDto = {
            email: profile.emails[0].value,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            avatarUrl: profile.photos?.[0]?.value,
            googleId: profile.id,
        };
        const user = await this.authService.validateGoogleUser(googleUser);
        return done(null, user);
    }
}