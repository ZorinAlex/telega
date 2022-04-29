import { Injectable, Logger } from '@nestjs/common';
import { LocationDto } from '../telegram/dto/location.dto';
import { TelegramService } from '../telegram/telegram.service';
import * as _ from 'lodash';
import { Api } from 'telegram';
import { RegionDto } from './dto/region.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Region, RegionDocument } from '../locationSchemas/region.schema';
import { Scan, ScanDocument } from '../locationSchemas/scan.schema';
import { User, UserDocument } from '../locationSchemas/user.schema';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ERegionScanStatus } from '../misc/enums/region.scan.status.enum';
import ILocation from '../misc/interfaces/location.interface';
import { getRegionData, getScanStepCoords } from './misc/region.locations';
import ILocatedUser from '../misc/interfaces/located.user.interface';
import IDistance from '../misc/interfaces/distance.interface';

@Injectable()
export class LocationService {
  constructor(
    private telegramService: TelegramService,
    @InjectModel(Region.name) private regionModel: Model<RegionDocument>,
    @InjectModel(Scan.name) private scanModel: Model<ScanDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ){
    this.setCurrentRegion();
  }

  private logger: Logger = new Logger("Location");
  private currentRegion: RegionDocument;
  private lastScanUsers: Array<User> = [];

  async findUsersByLocation(locationDto: LocationDto): Promise<Array<ILocatedUser>>{
    const nearby: Api.TypeUpdates = await this.telegramService.getUsersNearby(locationDto);
    let nearbyUsersData = [];
    if(nearby['updates'].length>0){
      _.forEach(nearby['updates'][0]['peers'], peer =>{
        if(_.has(peer, 'peer.userId')){
          const user = _.find(nearby['users'], user=> {
            return peer.peer.userId.toString() === user.id.toString()
          });
          if(user){
            const locatedUser: ILocatedUser = {
              bot: user.bot,
              verified: user.verified,
              fake: user.fake,
              accessHash: user.accessHash.toString(),
              firstName: user.firstName,
              lastName: user.lastName,
              username: user.username,
              phone: user.phone,
              id: user.id.toString(),
              distance: peer.distance,
              locationFind: locationDto
            };
            nearbyUsersData.push(locatedUser)
          }
        }
      });
    }
    return nearbyUsersData
  }

  async addRegion(regionDto: RegionDto){
    const regionData = getRegionData(regionDto);
    const region = {...regionDto, ...regionData};
    return await new this.regionModel(region).save();
  }

  async setCurrentRegion() {
    this.currentRegion = await this.regionModel.findOne({status: ERegionScanStatus.ACTIVE}).populate('scans').exec();
    if(!_.isNil(this.currentRegion)){
      if(_.has(this.currentRegion, 'scans')){
        this.lastScanUsers = this.currentRegion['scans'][this.currentRegion['scans'].length - 1].populate('users').exec();
      }
    }else{
      this.currentRegion = await this.regionModel.findOne({status: ERegionScanStatus.SCHEDULED}).populate('scans').exec();
      if(!_.isNil(this.currentRegion)){
        this.currentRegion.status = ERegionScanStatus.ACTIVE;
        await this.currentRegion.save();
      }
    }
    if(!_.isNil(this.currentRegion)) this.logger.log(`region setup: ${this.currentRegion._id}`);
  }

  async saveUsers(usersArray: Array<ILocatedUser>, currentScan: ScanDocument){
    for(let i = 0; i< usersArray.length; i++){
      const currentUser: ILocatedUser = usersArray[i];
      const oldUser: UserDocument= await this.userModel.findOne({id: currentUser.id}).exec();
      if(!_.isNil(oldUser)){
        const oldScan = _.find(oldUser.scans, scan => scan._id === currentScan._id);
        if(_.isNil(oldScan)) {
          oldUser.scans.push(currentScan._id);
          const oldDistance: Array<IDistance> = oldUser.distance;
          oldUser.distance = [...oldDistance, {scanId: currentScan._id, distance: currentUser.distance}];
          await oldUser.save()
        }
        currentScan.users.push(oldUser._id);
        await currentScan.save();
      }else{
        const newUser = new this.userModel(currentUser);
        newUser.scans.push(currentScan._id);
        newUser.distance = [{scanId: currentScan._id, distance: currentUser.distance}];
        await newUser.save();
        currentScan.users.push(newUser._id);
        await currentScan.save();
      }
    }
  }

  compareUsersArrays(firstArr, secondArr){
    if(firstArr.length !== secondArr.length){
      return false
    }else{
      _.forEach(firstArr, (el, index) => {
        if(el.id !== secondArr[index].id) return false;
      })
    }
    return true
  }

  async scanStep(){
    if(_.isNil(this.currentRegion)){
      await this.setCurrentRegion();
      return;
    }
    const currentStep: number = this.currentRegion['scans'].length + 1;
    const scanCoords: ILocation = getScanStepCoords(currentStep, this.currentRegion);
    this.logger.log(`scan step: ${currentStep}`);
    if(!_.isNil(scanCoords)){
      const users: Array<ILocatedUser> = await this.findUsersByLocation(scanCoords);
      if(!this.compareUsersArrays(this.lastScanUsers, users)){
        const scan: ScanDocument = await new this.scanModel({regionId: this.currentRegion._id, location: scanCoords}).save();
        await this.saveUsers(users, scan);
        this.currentRegion = await this.regionModel.findById(this.currentRegion._id).populate('scans').exec();
      }
    }else{
      this.logger.log(`region scanned: ${this.currentRegion._id}`);
      this.currentRegion.status = ERegionScanStatus.DONE;
      await this.currentRegion.save();
      this.currentRegion = null;
      await this.setCurrentRegion();
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  handleCron() {
    this.scanStep();
  }

  async getRegions(){
    return await this.regionModel.find().exec()
  }

  async getStatus(){
    return this.currentRegion
  }
}
