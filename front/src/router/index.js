import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/channels',
    name: 'channels',
    component: () => import('../views/ChannelsView.vue'),
  },
  {
    path: '/channel/:id',
    name: 'channel',
    component: () => import('../views/ChannelView.vue'),
  },
  {
    path: '/users',
    name: 'users',
    component: () => import('../views/UsersView.vue'),
  },
  {
    path: '/user/:id',
    name: 'user',
    component: () => import('../views/UserView.vue'),
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('../views/MapView.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
