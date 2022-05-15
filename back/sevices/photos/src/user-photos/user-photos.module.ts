import { Module } from '@nestjs/common';
import { UserPhotosService } from './user-photos.service';
import { TelegramModule } from '../telegram/telegram.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Photo, PhotoSchema } from 'src/schemas/photo.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    TelegramModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Photo.name, schema: PhotoSchema },
    ])
  ],
  providers: [UserPhotosService]
})
export class UserPhotosModule {}
