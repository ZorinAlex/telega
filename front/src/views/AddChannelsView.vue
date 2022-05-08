<template>
  <v-container>
    <v-card>
      <v-card-title>Додати чати до сканування</v-card-title>
      <v-card-text>формат: https://t.me/name ...</v-card-text>
      <v-textarea class="mx-4" v-model="scanChannels"></v-textarea>
      <v-card-actions>
        <v-btn
          @click="addChannels"
          :loading="loading"
        >Надіслати</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { mapActions } from 'vuex';
import * as _ from 'lodash';

export default {
  name: 'Add-Channels-page',
  components: { },
  data() {
    return {
      scanChannels: '',
      loading: false,
    };
  },
  methods: {
    ...mapActions([
      'sendChannelsForScan',
    ]),
    openChannelInfo(id) {
      this.$router.push({ name: 'channel', params: { id } });
    },
    async addChannels() {
      this.loading = true;
      const regex = new RegExp('https:\\/\\/t.me\\/(\\w{4,})', 'gm');
      const channels = this.scanChannels.match(regex);
      let filtered = _.map(channels, (channel) => channel.replace('https://t.me/', ''));
      filtered = [...new Set(filtered)];
      const resut = await this.sendChannelsForScan(filtered);
      console.log(resut.data);
      this.scanChannels = '';
      this.loading = false;
    },
  },
};
</script>

<style>
</style>
