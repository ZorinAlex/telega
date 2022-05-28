import { Controller, Get, HttpCode, HttpException, HttpStatus, Param, StreamableFile, UseGuards } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import { JwtAuthGuard } from '../../../channels/src/auth/auth.jwt.auth.guard';
import { UserPhotosService } from './user-photos.service';

@Controller('photo')
export class UserPhotosController {
  constructor(  private userPhotosService: UserPhotosService){}

  @Get('/:userId/:index')
  getFile(@Param('userId') userId: string, @Param('index') index: string): StreamableFile {
    const path = join(__dirname, '../../', 'photos/', userId, '/', index + '.jpg');
    if(existsSync(path)){
      const file = createReadStream(path);
      return new StreamableFile(file);
    }else {
      throw new HttpException('Photo not exists', HttpStatus.NOT_FOUND)
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  @HttpCode(HttpStatus.OK)
  async status(){
    return this.userPhotosService.status()
  }
}
