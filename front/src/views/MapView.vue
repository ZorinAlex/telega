<template>
  <div style="height: 100%" class="map-container">
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
        v-for="region in regions" :key="region._id"
        :bounds="[{lat:region.minLat, lng: region.minLng}, {lat:region.maxLat, lng: region.maxLng}]"
        :l-style="getRegionStyle(region.status)">
      </l-rectangle>
      <l-rectangle
        v-if="getRectangle.bounds.length>1"
        :bounds="getRectangle.bounds"
        :l-style="getRectangle.style"
      />
    </l-map>
    <div class="map-panel">
      <v-btn
        text
        class="mx-1"
        @click.prevent="addCircles"
      >Показати</v-btn>
      <v-btn
        text
        class="mx-1"
        @click.prevent="clearRegion"
      >Очистити</v-btn>
      <v-btn
        text
        class="mx-1"
        @click.prevent="addRegionOnMap"
      >Сканувати</v-btn>
      <v-text-field
        class="ma-2 mt-2"
        label="Radius"
        outlined
        v-model="radius"
        type="number"
        suffix="m"
        dense
        hide-details
      ></v-text-field>
    </div>
  </div>

</template>

<script>
import {
  LMap, LTileLayer, LMarker, LCircle, LRectangle,
} from 'vue2-leaflet';
import { Icon } from 'leaflet';
import * as _ from 'lodash';
import { mapActions, mapGetters } from 'vuex';
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
      zoom: 4,
      center: [50.25396978003467, 30.52426519066376],
      markers: [],
      radius: 2000,
      circles: [],
      rectangle: {
        bounds: [],
        style: { color: 'red', weight: 1 },
      },
      direction: 0,
    };
  },
  methods: {
    ...mapActions([
      'getRegions',
      'addRegion',
    ]),
    addMarker(event) {
      this.rectangle.bounds.push(event.latlng);
      this.markers.push(event.latlng);
    },
    getRegionStyle(status) {
      switch (status) {
        case 'done':
          return { color: 'green', weight: 1, fillColor: 'green' };
        case 'active':
          return { color: 'yellow', weight: 1, fillColor: 'yellow' };
        case 'scheduled':
          return { color: 'red', weight: 1, fillColor: 'red' };
        default:
          return { color: 'red', weight: 1, fillColor: 'red' };
      }
    },
    clearRegion() {
      this.rectangle.bounds = [];
      this.markers = [];
      this.circles = [];
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
    async addRegionOnMap() {
      const minMax = this.getMinMax();
      await this.addRegion({
        minLat: minMax.minLat,
        minLng: minMax.minLng,
        maxLat: minMax.maxLat,
        maxLng: minMax.maxLng,
        radius: Number(this.radius),
      });
      this.clearRegion();
    },
    calcScanCoords(step) {
      const startOffset = { x: 0, y: 0 };
      const minMax = this.getMinMax();
      const heightLat = this.getDistance(
        { lat: minMax.minLat, lng: minMax.minLng },
        { lat: minMax.maxLat, lng: minMax.minLng },
      );
      const widthLng = this.getDistance(
        { lat: minMax.minLat, lng: minMax.minLng },
        { lat: minMax.minLat, lng: minMax.maxLng },
      );
      const stepsByHeight = Math.ceil(heightLat / (Number(this.radius) * 2));
      const stepsByWidth = Math.ceil(widthLng / (Number(this.radius) * 2));
      if (step > stepsByHeight * stepsByWidth) return null;
      const coverHeight = stepsByHeight * Number(this.radius) * 2;
      const coverWidth = stepsByWidth * Number(this.radius) * 2;
      startOffset.x = (coverWidth - widthLng) / 2;
      startOffset.y = (coverHeight - heightLat) / 2;
      const finalDistanceXLon = Math.ceil(step / stepsByHeight) * (Number(this.radius) * 2)
        - startOffset.x - Number(this.radius);
      const finalDistanceYLat = (step % stepsByHeight) * (Number(this.radius) * 2) - startOffset.y
        + Number(this.radius);
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
      this.circles.push({ latlng: coords, radius: Number(this.radius), color: '#ff00ff' });
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
  computed: {
    ...mapGetters([
      'regions',
    ]),
    getRectangle() {
      return this.rectangle;
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
    this.getRegions();
  },
};
</script>

<style>
  .map-container{
    position: relative;
  }
  .map-panel{
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 10000000;
    background-color: white;
    padding: 10px;
    border-radius: 5px;
  }
</style>
