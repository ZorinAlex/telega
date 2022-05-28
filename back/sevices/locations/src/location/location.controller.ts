import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { LocationDto } from '../telegram/dto/location.dto';
import { LocationService } from './location.service';
import { RegionDto } from './dto/region.dto';
import { JwtAuthGuard } from '../../../channels/src/auth/auth.jwt.auth.guard';

@Controller('location')
export class LocationController {
  constructor(
    private locationService: LocationService
  ){}

  @Post('users')
  @HttpCode(HttpStatus.OK)
  async findUser(@Body() locationDto: LocationDto){
    return await this.locationService.findUsersByLocation(locationDto)
  }

  @UseGuards(JwtAuthGuard)
  @Post('region')
  @HttpCode(HttpStatus.OK)
  async addRegion(@Body() regionDto: RegionDto){
    return await this.locationService.addRegion(regionDto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('regions')
  @HttpCode(HttpStatus.OK)
  async getRegions(){
    return await this.locationService.getRegions();
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getStatus(){
    return await this.locationService.getStatus();
  }
}
