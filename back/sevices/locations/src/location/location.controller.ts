import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LocationDto } from '../telegram/dto/location.dto';
import { LocationService } from './location.service';
import { RegionDto } from './dto/region.dto';

@Controller('location')
export class LocationController {
  constructor(
    private locationService: LocationService
  ){}

  @Post('users')
  @HttpCode(HttpStatus.OK)
  async findChannel(@Body() locationDto: LocationDto){
    return await this.locationService.findUsersByLocation(locationDto)
  }

  @Post('region')
  @HttpCode(HttpStatus.OK)
  async addRegion(@Body() regionDto: RegionDto){
    return await this.locationService.addRegion(regionDto)
  }

  @Get('regions')
  @HttpCode(HttpStatus.OK)
  async getRegions(){
    return await this.locationService.getRegions();
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getStatus(){
    return await this.locationService.getStatus();
  }
}
