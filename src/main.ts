import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {Logger, ValidationPipe} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {cors: true});
  
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT') || 3000;

  await app.listen(PORT, ()=> {
    logger.log(`Application is running on port: ${PORT}`)
  });
}
bootstrap();
