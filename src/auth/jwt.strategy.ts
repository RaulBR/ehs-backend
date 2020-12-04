import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { Strategy, ExtractJwt, VerifiedCallback } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { AuthService } from "src/auth/auth.service";
import { Payload } from "src/models/payload.model";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: 'secret2'
        });
    }

    async validate(payload: Payload, done: VerifiedCallback) {
        const user = await this.authService.validateUser(payload.payload);
        if (!user) {
            return done(new HttpException('Unoutherized', HttpStatus.UNAUTHORIZED), false)
        }
        return done(null, user, payload.iat)
    }

}

