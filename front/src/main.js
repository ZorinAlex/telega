import Vue from 'vue';
import VueCookies from 'vue-cookies';
import App from './App.vue';
import router from './router';
import store from './store';
import vuetify from './plugins/vuetify';
import 'leaflet/dist/leaflet.css';

Vue.config.productionTip = false;
Vue.use(VueCookies, { expire: '7d' });

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
