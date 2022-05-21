
export default class FindUserDto {
  id?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  withPhoneOnly?: boolean;
  withPhotoOnly?: boolean;
  limit?: number;
  skip?: number;
  fullData: boolean;
}