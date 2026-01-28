import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import jwtConfig from "../config/jwt.config";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(config: ConfigService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        });
    }

    validate(payload: any){
        console.log('Inside JWT strategy Validate');
        console.log(payload);
        const id = payload.sub ?? payload.id;
        if (!id) throw new UnauthorizedException("Token payload missing user id");

        return { id, username: payload.username };
    }
}