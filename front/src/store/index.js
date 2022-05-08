import Vue from 'vue';
import Vuex from 'vuex';
import * as _ from 'lodash';
import request, { locationRequest, authRequest, channelsRequest } from '../service/request';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    users: [],
    channels: [],
    regions: [],
    channel: null,
    user: null,
    auth: null,
  },
  getters: {
    channels(state) {
      return state.channels;
    },
    channel(state) {
      return state.channel;
    },
    user(state) {
      return state.user;
    },
    regions(state) {
      return state.regions;
    },
    isLogged(state) {
      return !_.isNil(state.auth);
    },
  },
  mutations: {
    addChannels(state, channels) {
      state.channels = channels;
    },
    addChannel(state, channel) {
      state.channel = channel;
    },
    addUser(state, user) {
      state.user = user;
    },
    addRegions(state, regions) {
      state.regions = regions;
    },
    addRegion(state, region) {
      state.regions.push(region);
    },
    addAuth(state, auth) {
      state.auth = auth;
    },
  },
  actions: {
    async findChannel({ commit }, id) {
      const channel = await request.post('/channel', {
        id,
      });
      commit('addChannel', channel.data);
    },
    async getAllChannels({ commit }) {
      const channels = await request.get('/channels');
      commit('addChannels', channels.data);
    },
    async findUser({ commit }, data) {
      const channel = await request.post('/user', data);
      commit('addUser', channel.data);
    },
    async getRegions({ commit }) {
      const regions = await locationRequest.get('/regions');
      commit('addRegions', regions.data);
    },
    async addRegion({ commit, dispatch }, region) {
      await dispatch('sendRequestWithAuth', { axiosConst: locationRequest, path: '/region', data: region });
      commit('addRegion', { ...region, status: 'scheduled' });
    },
    async login({ commit }, auth) {
      try {
        const authData = await authRequest.post('/login', auth);
        commit('addAuth', authData.data);
        Vue.$cookies.set('authToken', authData.data.access);
        Vue.$cookies.set('refreshToken', authData.data.refresh);
      } catch (e) {
        console.log(e);
      }
    },
    async refresh({ commit }) {
      const refresh = Vue.$cookies.get('refreshToken');
      const authData = await authRequest.post('/refresh', { refreshToken: refresh });
      const authToken = authData.data.access;
      commit('addAuth', { auth: authToken, refresh });
    },
    async setAuthFromCookies({ commit }) {
      const auth = Vue.$cookies.get('authToken');
      const refresh = Vue.$cookies.get('refreshToken');
      if (!_.isNil(auth) && !_.isNil(refresh)) {
        commit('addAuth', { auth, refresh });
      }
    },
    async sendChannelsForScan({ dispatch }, data) {
      await dispatch('sendRequestWithAuth', { axiosConst: channelsRequest, path: '/channels', data: { channels: data } });
    },
    async sendRequestWithAuth({ state, dispatch }, requestData) {
      const { data } = requestData;
      try {
        return await requestData.axiosConst.post(requestData.path, data, {
          // eslint-disable-next-line quote-props
          headers: { 'Authorization': `Bearer ${state.auth.auth}` },
        });
      } catch (e) {
        await dispatch('refresh');
        try {
          return await requestData.axiosConst.post(requestData.path, data, {
            // eslint-disable-next-line quote-props
            headers: { 'Authorization': `Bearer ${state.auth.auth}` },
          });
        } catch (error) {
          return error;
        }
      }
    },
  },
});
