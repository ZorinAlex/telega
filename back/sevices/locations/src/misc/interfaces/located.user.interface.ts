import ILocation from './location.interface';

export default interface ILocatedUser {
  bot: boolean,
  verified: boolean,
  fake: boolean,
  accessHash: string,
  firstName: string,
  lastName: string,
  username: string,
  phone: string,
  id: string,
  distance: number,
  locationFind: ILocation
}