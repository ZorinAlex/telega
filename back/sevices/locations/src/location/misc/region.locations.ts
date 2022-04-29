import ILocation from '../../misc/interfaces/location.interface';
import { RegionDocument } from '../../locationSchemas/region.schema';
import { RegionDto } from '../dto/region.dto';

function getRegionData(region: RegionDto) {
  const heightLat = getDistance(
    { lat: region.minLat, lng: region.minLng },
    { lat: region.maxLat, lng: region.minLng },
  );
  const widthLng = getDistance(
    { lat: region.minLat, lng: region.minLng },
    { lat: region.minLat, lng: region.maxLng },
  );
  const stepsByHeight = Math.ceil(heightLat / (region.radius * 2));
  const stepsByWidth = Math.ceil(widthLng / (region.radius * 2));
  const coverHeight = stepsByHeight * region.radius * 2;
  const coverWidth = stepsByWidth * region.radius * 2;
  const startOffsetX = (coverWidth - widthLng) / 2;
  const startOffsetY = (coverHeight - heightLat) / 2;
  return{
    stepsByHeight,
    stepsByWidth,
    startOffsetX,
    startOffsetY
  }
}

function getScanStepCoords(step: number, region: RegionDocument): ILocation {
  if (step > region.stepsByHeight * region.stepsByWidth) return null;
  const finalDistanceXLon = Math.ceil(step / region.stepsByHeight) * (region.radius * 2)
    - region.startOffsetX - region.radius;
  const finalDistanceYLat = (step % region.stepsByHeight) * (region.radius * 2) - region.startOffsetY + region.radius;
  return {
    lat: getCoordsByDistanceAndDirection(
      { lat: region.minLat, lng: region.minLng },
      finalDistanceYLat,
      0,
    ).lat,
    lng: getCoordsByDistanceAndDirection(
      { lat: region.minLat, lng: region.minLng },
      finalDistanceXLon,
      Math.PI / 2,
    ).lng,
  };
}

function getDistance(firstLocation: ILocation, secondLocation: ILocation): number {
  const R = 6371e3;
  const fi1 = firstLocation.lat * (Math.PI / 180);
  const fi2 = secondLocation.lat * (Math.PI / 180);
  const deltaFi = (secondLocation.lat - firstLocation.lat) * (Math.PI / 180);
  const deltaLambda = (secondLocation.lng - firstLocation.lng) * (Math.PI / 180);
  const a = Math.sin(deltaFi / 2) * Math.sin(deltaFi / 2)
    + Math.cos(fi1) * Math.cos(fi2)
    * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function getCoordsByDistanceAndDirection(startLocation: ILocation, distance: number, directionAngle: number): ILocation {
  const R = 6371e3;
  const fi1 = (startLocation.lat * Math.PI) / 180;
  const lambda1 = (startLocation.lng * Math.PI) / 180;
  const fi2 = Math.asin(Math.sin(fi1) * Math.cos(distance / R)
    + Math.cos(fi1) * Math.sin(distance / R) * Math.cos(directionAngle));
  const lambda2 = lambda1 + Math.atan2(
    Math.sin(directionAngle) * Math.sin(distance / R) * Math.cos(fi1),
    Math.cos(distance / R) - Math.sin(fi1) * Math.sin(fi2),
  );
  return {
    lat: (fi2 * 180) / Math.PI,
    lng: (lambda2 * 180) / Math.PI,
  };
}

export {getRegionData, getScanStepCoords}