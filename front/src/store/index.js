import Vue from 'vue';
import Vuex from 'vuex';
import request from '../service/request';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    users: [],
    channels: [],
    channel: null,
    user: null,
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
  },
});
