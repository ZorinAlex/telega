import { Controller, Get, HttpCode, HttpStatus, Post, UseGuards, Request, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.jwt.auth.guard';
import { TelegaService } from './telega.service';
import AddChannelsDto from './dto/add.channels.dto';

@Controller('telega')
export class TelegaController {
  constructor(
    private telegaService: TelegaService
  ){}

  @Get('channels')
  @HttpCode(HttpStatus.OK)
  async getBoxes(){
    return await this.telegaService.getChannels()
  }

  @UseGuards(JwtAuthGuard)
  @Post('channels')
  @HttpCode(HttpStatus.OK)
  async addChannelsToScan(@Body() addChannelsDto: AddChannelsDto){
    return await this.telegaService.addToScan(addChannelsDto)
  }
}
