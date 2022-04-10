import {Body, Controller, Post, UseGuards, Request, HttpCode, HttpStatus} from '@nestjs/common';
import {AuthService} from "./auth.service";
import LoginDto from "./dto/login.dto";
import RefreshDto from "./dto/refresh.dto";
import {JwtAuthGuard} from "./auth.jwt.auth.guard";
import OnlineDto from './dto/online.dto';
import OneSignalDto from './dto/one.signal.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ){}

    // @Post('login')
    // @HttpCode(HttpStatus.OK)
    // async login(@Body() login: LoginDto){
    //     return await this.authService.login(login);
    // }
    //
    // @Post('refresh')
    // @HttpCode(HttpStatus.OK)
    // async refreshToken(@Body() refresh: RefreshDto){
    //     return await this.authService.refresh(refresh);
    // }
    //
    // @UseGuards(JwtAuthGuard)
    // @Post('logout')
    // @HttpCode(HttpStatus.OK)
    // async logout(@Request() req){
    //     return await this.authService.logout(req.user);
    // }
}
