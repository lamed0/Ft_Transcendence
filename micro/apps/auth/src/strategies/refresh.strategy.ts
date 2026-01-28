import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh'){
    constructor(config: ConfigService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_REFRESH_SECRET,
            passReqToCallback: true,
        } as any)
    }

    validate(req: Request, payload: any) {
    const refreshToken = req.get('authorization')?.replace('Bearer ', '');

    return {
      userId: payload.sub,
      refreshToken,
    };
  }
}