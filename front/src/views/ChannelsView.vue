<template>
  <v-container>
    <v-data-iterator
      :items="this.channels"
      :items-per-page="6"
      :search="search"
      :footer-props="{
        'items-per-page-options': [6, 12, 24, -1],
      }"
    >
      <template v-slot:header>
        <v-toolbar
          class="mb-3"
        >
          <v-text-field
            v-model="search"
            clearable
            flat
            solo-inverted
            hide-details
            prepend-inner-icon="mdi-magnify"
            label="Search"
          ></v-text-field>
        </v-toolbar>
      </template>
      <template v-slot:default="props">
        <v-row>
          <v-col
            v-for="item in props.items"
            :key="item.name"
            cols="12"
            sm="6"
            md="4"
            lg="4"
          >
            <v-card>
              <v-card-title class="subheading font-weight-bold">
                {{ item.name }}
              </v-card-title>

              <v-divider></v-divider>
              <long-text
                :text="item.about"
                :height="80"
                :length="80"
              />
              <v-list dense>
                <v-list-item>
                  <v-list-item-icon>
                    <v-icon>mdi-account</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Користувачі: {{item.participantsCount}}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-icon>
                    <v-icon>mdi-lock</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Заблоковано: {{item.blocked}}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-icon>
                    <v-icon>mdi-key</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>id: {{item.id}}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-icon>
                    <v-icon>mdi-calendar-clock</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Дата: {{new Date(item.scanDate)
                      .toLocaleString(undefined, {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-icon>
                    <v-icon>mdi-wechat</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title>Чати: {{item.chats.length}}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
              <v-btn
                block
                @click="openChannelInfo(item._id)"
              >Детальніше</v-btn>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-data-iterator>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import longText from '../components/long-text.vue';

export default {
  name: 'Channels-page',
  components: {
    longText,
  },
  data() {
    return {
      name: null,
      search: '',
      loading: false,
    };
  },
  methods: {
    ...mapActions([
      'getAllChannels',
      'sendChannelsForScan',
    ]),
    openChannelInfo(id) {
      this.$router.push({ name: 'channel', params: { id } });
    },
  },
  computed: {
    ...mapGetters([
      'channels',
    ]),
  },
  mounted() {
    this.getAllChannels();
  },
};
</script>

<style>
  .text--about{
    height: 80px;
  }
</style>
