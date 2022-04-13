import { ArrayNotEmpty } from 'class-validator';

export default class AddChannelsDto {
  @ArrayNotEmpty()
  channels: Array<string>
}