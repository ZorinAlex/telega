
export default class FindUserDto {
  id?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  withPhoneOnly?: boolean;
  fullData: boolean;
}