import {Body, Controller, Post, HttpCode, HttpStatus,Request} from '@nestjs/common';
import {AuthService} from "./auth.service";
import LoginDto from "./dto/login.dto";
import RefreshDto from "./dto/refresh.dto";

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ){}

    // @Post('register')
    // @HttpCode(HttpStatus.OK)
    // async register(@Body() login: LoginDto){
    //     return await this.authService.register(login);
    // }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() login: LoginDto){
        return await this.authService.login(login);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Request() req){
        return await this.authService.logout(req.user);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body() refresh: RefreshDto){
        return await this.authService.refresh(refresh);
    }
}
