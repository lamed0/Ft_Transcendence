import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh'){
    constructor(config: ConfigService){
        super({
            jwtFromRequest: (req: Request) => {
                return req.cookies?.refreshToken;
            },
            secretOrKey: process.env.JWT_REFRESH_SECRET,
            passReqToCallback: true,
        } as any)
    }

    validate(req: Request, payload: any) {
        const refreshToken = req.cookies?.refreshToken;

        return {
            userId: payload.sub,
            refreshToken,
        };
    }
}
