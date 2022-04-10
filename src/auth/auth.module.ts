import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {JwtStrategy} from "./auth.jwt.strategy";

@Module({
  imports: [
      JwtModule.registerAsync({
        imports:[ConfigModule],
        useFactory: async (configService: ConfigService) => {
          return configService.get('auth')
        },
        inject: [ConfigService]
      }),
      ConfigModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
