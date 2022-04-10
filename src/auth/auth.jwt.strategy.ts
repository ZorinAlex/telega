import {PassportStrategy} from "@nestjs/passport";
import {ExtractJwt, Strategy} from "passport-jwt";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import ErrorsMessages from "../core/errors.messages";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('auth').secret,
        });
    }

    async validate(payload: any) {
        // const currentUser = await this.userRepository.findOne(payload.id);
        // if(currentUser.status === EUserStatus.BANNED) throw new HttpException(ErrorsMessages.BANNED_USER, HttpStatus.FORBIDDEN);
        // if(currentUser.status === EUserStatus.DELETED) throw new HttpException(ErrorsMessages.DELETED_USER, HttpStatus.FORBIDDEN);
        // return { id: payload.id};
    }
}
