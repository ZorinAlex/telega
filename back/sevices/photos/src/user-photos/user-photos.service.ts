import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TelegramService } from '../telegram/telegram.service';
import * as _ from 'lodash';
import { join } from 'path';
import * as fs from 'fs';
import { Photo, PhotoDocument } from '../schemas/photo.schema';
import { User, UserDocument } from '../schemas/user.schema';
const ConsoleProgressBar = require('console-progress-bar');

@Injectable()
export class UserPhotosService {
  private logger: Logger = new Logger('User Photo');
  private consoleProgressBar: typeof ConsoleProgressBar;

  constructor(
    @InjectModel(Photo.name) private photoModel: Model<PhotoDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private telegramService: TelegramService,
  ) {
    (async () => {
      await this.preload();
      setTimeout(() => {
        this.scan();
      }, 5000);
    })();
  }

  private totalUsersForScan: number;

  private async preload() {
    this.totalUsersForScan = await this.userModel.count({ isPhotosScanned: false }).exec();
    this.consoleProgressBar = new ConsoleProgressBar({ maxValue: this.totalUsersForScan });
  }

  private async scan() {
    const user: UserDocument = await this.userModel.findOne({ isPhotosScanned: false }).exec();
    if (!_.isNil(user)) {
      await this.scanUserPhotos(user);
      this.scan();
    }
  }

  private async cleanUsers(){
    const users: Array<UserDocument> = await this.userModel.find({ isPhotosScanned: true }).limit(500).exec();
    if (!_.isNil(users)) {
      for(let i = 0; i< users.length; i++){
        const user = users[i];
        user.isPhotosScanned = false;
        user.photos = [];
        await user.save();
      }
      this.cleanUsers();
    }else {
      this.logger.log('users cleaned')
    }
  }

  private async scanUserPhotos(user: UserDocument) {
    this.logger.log(user.id);
    let photos = [];
    let photosDB = [];
    if (!_.isNil(user.username)) {
      photos = await this.telegramService.getUserPhotos(user.username, false);
    } else {
      photos = await this.telegramService.getUserPhotos(user.id, true);
    }
    if (!_.isNil(photos)) {
      for (let photoIndex = 0; photoIndex < photos.length; photoIndex++) {
        const savePath = join(__dirname, '../../', 'photos/', user._id.toString(), '/', photoIndex + '.jpg');
        const userfolder = join(__dirname, '../../', 'photos/', user._id.toString());
        if (!fs.existsSync(userfolder)) {
          await fs.mkdirSync(userfolder);
        }
        const newPhoto = await new this.photoModel({
          userMongoId: user._id,
          path: savePath,
        }).save();
        photosDB.push(newPhoto);
        await fs.writeFileSync(savePath, photos[photoIndex]);
      }
    }
    user.isPhotosScanned = true;
    user.photos = photosDB;
    await user.save();
    this.consoleProgressBar.addValue(1);
  }

}
