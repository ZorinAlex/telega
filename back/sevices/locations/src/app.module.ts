import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {appConfig} from "./config/app.config";
import {APP_FILTER} from "@nestjs/core";
import {ExceptionsFilter} from "./core/exceptions.filter";
import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AppLoggerMiddleware } from './core/app.logger.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegramModule } from './telegram/telegram.module';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
      ConfigModule.forRoot({
        envFilePath: `.${process.env.NODE_ENV}.env`,
        isGlobal: true,
        load: [appConfig]
      }),
      MongooseModule.forRootAsync({
        connectionName: 'telega',
        imports: [ConfigModule],
        useFactory: async (config: ConfigService) => ({
          uri: `mongodb+srv://${config.get('database_telega').username}:${config.get('database_telega').password}@${config.get('database_telega').cluster}/${config.get('database_telega').database}?retryWrites=true&w=majority`,
          useNewUrlParser: true,
          useUnifiedTopology: true
        }),
        inject: [ConfigService],
      }),
      MongooseModule.forRootAsync({
        connectionName: 'locations',
        imports: [ConfigModule],
        useFactory: async (config: ConfigService) => ({
          uri: `mongodb+srv://${config.get('database_locations').username}:${config.get('database_locations').password}@${config.get('database_locations').cluster}/${config.get('database_locations').database}?retryWrites=true&w=majority`,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }),
        inject: [ConfigService],
      }),
      AuthModule,
      ScheduleModule.forRoot(),
      TelegramModule,
      LocationModule
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
