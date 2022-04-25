<template>
  <div style="height: 100%">
    <l-map :zoom="zoom" :center="center" @click="addMarker">
      <l-tile-layer :url="url"></l-tile-layer>
      <l-marker v-for="(marker, index) in markers" :key="index" :lat-lng="marker"></l-marker>
      <l-circle
        v-for="(circle, index) in circles" :key="index"
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
    >Add</v-btn>
  </div>

</template>

<script>
import {
  LMap, LTileLayer, LMarker, LCircle, LRectangle,
} from 'vue2-leaflet';
import { Icon } from 'leaflet';
import * as _ from 'lodash';

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
    },
    addCircles() {
      const minMax = this.getMinMax();
      const start = { lat: minMax.minLat, lng: minMax.minLng };
      const latDiff = this.getCoordsByDistanceAndDirection(start, 4000, 0).lat - start.lat;
      const lngDiff = this.getCoordsByDistanceAndDirection(start, 4000, Math.PI / 2).lng
        - start.lng;
      let latStep = 0;
      let lngStep = 0;
      let isFillRow = true;
      // eslint-disable-next-line no-plusplus
      while (start.lng + lngStep * lngDiff < minMax.maxLng + lngDiff) {
        const coords = { lat: start.lat + latStep * latDiff, lng: start.lng + lngStep * lngDiff };
        this.addCircle(coords);
        latStep += 1;
        if (start.lat + latStep * latDiff > minMax.maxLat + latDiff) {
          if (isFillRow) {
            isFillRow = false;
            latStep = 0.5;
            lngStep += 0.5;
          } else {
            isFillRow = true;
            latStep = 0;
            lngStep += 0.5;
          }
        }
      }
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
  },
};
</script>
