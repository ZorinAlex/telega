import { Controller, Get, HttpException, HttpStatus, Param, StreamableFile } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

@Controller('photo')
export class UserPhotosController {

  @Get('/:userId/:index')
  getFile(@Param('userId') userId: string, @Param('index') index: string): StreamableFile {
    const path = join(__dirname, '../../', 'photos/', userId, '/', index + '.jpg');
    if(existsSync(path)){
      const file = createReadStream(path);
      return new StreamableFile(file);
    }else {
      throw new HttpException('Photo not exists', HttpStatus.NOT_FOUND)
    }  }
}
