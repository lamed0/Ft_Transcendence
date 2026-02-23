import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import jwtConfig from "../config/jwt.config";
import { Request } from "express";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(config: ConfigService){
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                // First try to get from Authorization header
                ExtractJwt.fromAuthHeaderAsBearerToken(),
                // Then try to get from HTTP-only cookie
                (req: Request) => req.cookies?.accessToken || null,
            ]),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
            passReqToCallback: false,
        });
    }

    validate(payload: any){
        console.log('Inside JWT strategy Validate');
        console.log(payload);
        const sub = payload.sub ?? payload.id;
        if (!sub) throw new UnauthorizedException("Token payload missing user id");

        return { sub, username: payload.username };
    }
}