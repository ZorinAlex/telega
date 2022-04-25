import { Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Request, Body } from '@nestjs/common';
import { TelegaService } from './telega.service';
import FindChannelsDto from './dto/find.channels.dto';
import FindUserDto from './dto/find.user.dto';

@Controller('telega')
export class TelegaController {
  constructor(
    private telegaService: TelegaService
  ){}

  @Get('channels')
  @HttpCode(HttpStatus.OK)
  async getChannels(){
    return await this.telegaService.getChannels()
  }

  @Post('channel')
  @HttpCode(HttpStatus.OK)
  async findChannel(@Body() findChannelsDto: FindChannelsDto){
    return await this.telegaService.findChannel(findChannelsDto)
  }

  @Post('user')
  @HttpCode(HttpStatus.OK)
  async getUser(@Body() findUserDto: FindUserDto){
    return await this.telegaService.findUser(findUserDto)
  }
}
