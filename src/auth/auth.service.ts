import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import LoginDto from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import TokensDto from './dto/tokens.dto';
import RefreshDto from './dto/refresh.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Editor, EditorDocument } from '../schemas/editor.schema';
import { Model } from 'mongoose';
import * as _ from 'lodash';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        @InjectModel(Editor.name) private editorModel: Model<EditorDocument>,
    ) { }

    async login(loginDto: LoginDto): Promise<TokensDto> {
        const user = await this.editorModel.findOne({login: loginDto.login}).exec();
        if(!_.isNil(user)){
            const isMatch = await bcrypt.compare(loginDto.password, user.password);
            if(isMatch){
                const accessToken = await this.jwtService.signAsync({id: user._id});
                const refreshToken = await this.jwtService.signAsync({id: user._id}, this.configService.get('refresh'));
                user.refresh = refreshToken;
                await user.save();
                return {
                    access: accessToken,
                    refresh: refreshToken
                }
            }else{
                throw new UnauthorizedException('WRONG PASSWORD')
            }
        }else {
            throw  new UnauthorizedException('USER NOT EXISTS')
        }
    }

    async refresh(refresh: RefreshDto): Promise<TokensDto> {
        const tokenPayload = await this.jwtService.verifyAsync(refresh.refreshToken, this.configService.get('refresh'));
        if (!_.has(tokenPayload, 'id')) throw new UnauthorizedException();
        const user = await this.editorModel.findById(tokenPayload.id).exec();
        if(_.isNil(user)) throw new UnauthorizedException('USER NOT EXISTS');
        if(user.refresh !== refresh.refreshToken) throw new UnauthorizedException('WRONG TOKEN');
        const accessToken = await this.jwtService.signAsync({id: user._id});
        return { access: accessToken}
    }

    async logout(user): Promise<boolean> {
        const userLogout = await this.editorModel.findById(user.id).exec();
        if(_.isNil(userLogout)) throw new UnauthorizedException('USER NOT EXISTS');
        userLogout.refresh = null;
        await userLogout.save();
        return true
    }

    async register(loginDto: LoginDto): Promise<boolean> {
        const encryptedPass = await bcrypt.hash(loginDto.password, Number(this.configService.get('auth').salt));
        await new this.editorModel({login: loginDto.login, password: encryptedPass}).save();
        return true
    }
}
