<template>
  <div style="height: 100%">
    <l-map :zoom="zoom" :center="center" @click="addMarker">
      <l-tile-layer :url="url"></l-tile-layer>
      <l-marker v-for="(marker, index) in markers" :key="index" :lat-lng="marker"></l-marker>
      <l-circle
        v-for="(circle, index) in circles" :key="Date.now() + index"
        :lat-lng="circle.latlng"
        :radius="circle.radius"
        :color="circle.color"
      >
      </l-circle>
      <l-rectangle
        v-if="rectangle.bounds.length>1"
        :bounds="rectangle.bounds"
        :l-style="rectangle.style"
      />
    </l-map>
    <v-btn
      style="{
        position: fixed; top: -185px;
        right: -11px;
        z-index: 100000000;}"
      @click.prevent="addCircles"
    >Show Region</v-btn>

    <v-btn
      style="{
        position: fixed;
        top: -138px;
        right: 129px;
        z-index: 100000000;}"
      @click.prevent="addRegion"
    >Add Region</v-btn>
  </div>

</template>

<script>
import {
  LMap, LTileLayer, LMarker, LCircle, LRectangle,
} from 'vue2-leaflet';
import { Icon } from 'leaflet';
import * as _ from 'lodash';
import { locationRequest } from '../service/request';

export default {
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LCircle,
    LRectangle,
  },
  data() {
    return {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      zoom: 7,
      center: [50.25396978003467, 30.52426519066376],
      markers: [],
      circles: [],
      rectangle: {
        bounds: [],
        style: { color: 'red', weight: 1 },
      },
      direction: 0,
    };
  },
  methods: {
    addMarker(event) {
      this.rectangle.bounds.push(event.latlng);
      this.markers.push(event.latlng);
      console.log(event.latlng);
      // this.findUsers(event.latlng);
      // this.findUsers(event.latlng);
    },
    addCircles() {
      let step = 1;
      let isOk = true;
      while (isOk) {
        const coords = this.calcScanCoords(step);
        if (coords) {
          this.addCircle(coords);
          step += 1;
        } else {
          isOk = false;
        }
      }
    },
    async addRegion() {
      const minMax = this.getMinMax();
      const region = await locationRequest.post('/region', {
        minLat: minMax.minLat,
        minLng: minMax.minLng,
        maxLat: minMax.maxLat,
        maxLng: minMax.maxLng,
        radius: 2000,
      });
      console.log(region);
    },
    calcScanCoords(step) {
      const startOffset = { x: 0, y: 0 };
      const radius = 2000;
      const minMax = this.getMinMax();
      const heightLat = this.getDistance(
        { lat: minMax.minLat, lng: minMax.minLng },
        { lat: minMax.maxLat, lng: minMax.minLng },
      );
      const widthLng = this.getDistance(
        { lat: minMax.minLat, lng: minMax.minLng },
        { lat: minMax.minLat, lng: minMax.maxLng },
      );
      const stepsByHeight = Math.ceil(heightLat / (radius * 2));
      const stepsByWidth = Math.ceil(widthLng / (radius * 2));
      if (step > stepsByHeight * stepsByWidth) return null;
      const coverHeight = stepsByHeight * radius * 2;
      const coverWidth = stepsByWidth * radius * 2;
      startOffset.x = (coverWidth - widthLng) / 2;
      startOffset.y = (coverHeight - heightLat) / 2;
      const finalDistanceXLon = Math.ceil(step / stepsByHeight) * (radius * 2)
        - startOffset.x - radius;
      const finalDistanceYLat = (step % stepsByHeight) * (radius * 2) - startOffset.y + radius;
      return {
        lat: this.getCoordsByDistanceAndDirection(
          { lat: minMax.minLat, lng: minMax.minLng },
          finalDistanceYLat,
          0,
        ).lat,
        lng: this.getCoordsByDistanceAndDirection(
          { lat: minMax.minLat, lng: minMax.minLng },
          finalDistanceXLon,
          Math.PI / 2,
        ).lng,
      };
    },
    getDistance(firstLocation, secondLocation) {
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
    },
    getMinMax() {
      return {
        minLat: _.minBy(this.rectangle.bounds, (coords) => coords.lat).lat,
        minLng: _.minBy(this.rectangle.bounds, (coords) => coords.lng).lng,
        maxLat: _.maxBy(this.rectangle.bounds, (coords) => coords.lat).lat,
        maxLng: _.maxBy(this.rectangle.bounds, (coords) => coords.lng).lng,
      };
    },
    addCircle(coords) {
      this.circles.push({ latlng: coords, radius: 2000, color: '#ff00ff' });
    },
    getCoordsByDistanceAndDirection(startLocation, distance, directionAngle) {
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
    },
    async findUsers(coords) {
      const nearby = await locationRequest.post('/users', coords);
      console.log(nearby.data);
    },
  },
  mounted() {
    delete Icon.Default.prototype._getIconUrl;
    Icon.Default.mergeOptions({
      // eslint-disable-next-line global-require
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      // eslint-disable-next-line global-require
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      // eslint-disable-next-line global-require
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });
    // setInterval(async () => {
    //   const time = new Date().toLocaleString();
    //   console.log(time);
    //   const coords = this.testPoints[this.currentTestCount];
    //   const nearby = await locationRequest.post('/users', {
    //     lat: coords.lat,
    //     lan: coords.lng,
    //   });
    //   console.log(_.isEqual(nearby.data, this.lastData));
    //   this.lastData = nearby.data;
    //   this.currentTestCount += 1;
    //   if (this.currentTestCount > this.testPoints.length - 1) this.currentTestCount = 0;
    // }, 1000 * 60);
  },
};
</script>
