import { Module } from '@nestjs/common';
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {JwtStrategy} from "./auth.jwt.strategy";
import { MongooseModule } from '@nestjs/mongoose';
import { Editor, EditorSchema } from '../schemas/editor.schema';

@Module({
  imports: [
      JwtModule.registerAsync({
        imports:[ConfigModule],
        useFactory: async (configService: ConfigService) => {
          return configService.get('auth')
        },
        inject: [ConfigService]
      }),
      MongooseModule.forFeature([
        { name: Editor.name, schema: EditorSchema }
      ], 'telega'),
      ConfigModule
  ],
  providers: [
    JwtStrategy],
})
export class AuthModule {}
