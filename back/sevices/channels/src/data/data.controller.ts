import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.jwt.auth.guard';
import { DataService } from './data.service';
import AddChannelsDto from './dto/add.channels.dto';

@Controller('data')
export class DataController {

  constructor(  private dataService: DataService){}

  @UseGuards(JwtAuthGuard)
  @Post('channels')
  @HttpCode(HttpStatus.OK)
  async addChannelsToScan(@Body() addChannelsDto: AddChannelsDto){
    return this.dataService.addChannels(addChannelsDto.channels);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  @HttpCode(HttpStatus.OK)
  async status(){
    return this.dataService.status()
  }
}
