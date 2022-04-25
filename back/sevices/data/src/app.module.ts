import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {appConfig} from "./config/app.config";
import {APP_FILTER} from "@nestjs/core";
import {ExceptionsFilter} from "./core/exceptions.filter";
import { AuthModule } from './auth/auth.module';
import { AppLoggerMiddleware } from './core/app.logger.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegaModule } from './telega/telega.module';

@Module({
  imports: [
      ConfigModule.forRoot({
        envFilePath: `.${process.env.NODE_ENV}.env`,
        isGlobal: true,
        load: [appConfig]
      }),
      MongooseModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (config: ConfigService) => ({
          uri: `mongodb+srv://${config.get('database').username}:${config.get('database').password}@cluster0.b28ht.mongodb.net/${config.get('database').database}?retryWrites=true&w=majority`,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
        inject: [ConfigService],
      }),
      AuthModule,
      TelegaModule
  ],
  providers: [
    {provide: APP_FILTER, useClass: ExceptionsFilter}
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
