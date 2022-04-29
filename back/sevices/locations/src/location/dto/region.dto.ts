import { IsNotEmpty } from 'class-validator';

export class RegionDto {
  @IsNotEmpty()
  minLat: number;
  @IsNotEmpty()
  minLng: number;
  @IsNotEmpty()
  maxLat: number;
  @IsNotEmpty()
  maxLng: number;
  @IsNotEmpty()
  radius: number;
}