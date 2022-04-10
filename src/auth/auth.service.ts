import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import LoginDto from './dto/login.dto';
import ErrorsMessages from '../core/errors.messages';
import * as _ from 'lodash';
import { ConfigService } from '@nestjs/config';
import TokensDto from './dto/tokens.dto';
import RefreshDto from './dto/refresh.dto';
import OnlineDto from './dto/online.dto';
import OneSignalDto from './dto/one.signal.dto';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService
    ) {
    }

    // async login(loginDto: LoginDto): Promise<TokensDto> {
    //
    // }
    //
    // async refresh(refresh: RefreshDto): Promise<TokensDto> {
    //
    // }
    //
    // async logout(user: User): Promise<boolean> {
    //
    // }
}
