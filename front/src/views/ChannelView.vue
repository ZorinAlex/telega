<template>
  <v-container v-if="channel">
    <v-row>
      <v-col
        cols="12"
        sm="6"
        md="4"
        lg="4"
      >
        <v-card class="mb-5">
          <v-card-title class="subheading font-weight-bold">
            {{ channel.name }}
          </v-card-title>
          <v-card-text>
            {{channel.about}}
          </v-card-text>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-account</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Користувачі: {{channel.participantsCount}}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-lock</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Заблоковано: {{channel.blocked}}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-key</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>id: {{channel.id}}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-calendar-clock</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Дата: {{new Date(channel.scanDate)
                  .toLocaleString(undefined, {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        sm="6"
        md="4"
        lg="4"
        v-for="chat in channel.chats" :key="chat._id"
      >
        <v-card class="mb-3">
          <v-card-title class="subheading font-weight-bold">
            {{chat.username}}
          </v-card-title>
          <v-card-text>
            {{chat.title}}
          </v-card-text>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-account</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Користувачі: {{chat.usersCount}}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-message</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Повідомлення: {{chat.messagesCount}}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-map</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Геопозиція: {{chat.hasGeo}}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-key</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>id: {{chat.id}}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-calendar-clock</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Дата: {{new Date(chat.date* 1000)
                  .toLocaleString(undefined, {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
    <v-row class="mx-1 mt-5" v-for="chat in channel.chats" :key="chat._id">
      <v-data-iterator
        v-if="chat.userchatmessages.length>0"
        :items="chat.userchatmessages"
        :items-per-page="6"
        :footer-props="{
          'items-per-page-options': [6, 12, 24, -1]
        }"
      >
        <template v-slot:header>
          <v-toolbar
            class="mb-2"
            dark
            flat
          >
            <v-toolbar-title>Топ 100 активних користувачів</v-toolbar-title>
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
                  {{ item.userMongoId.firstName }} {{ item.userMongoId.lastName }}
                </v-card-title>
                <v-card-text>
                  Повідомлень: {{ item.messagesCount }}
                </v-card-text>
                <v-divider></v-divider>
                <v-list dense>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-account</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>нік: {{item.userMongoId.username}}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-key</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>id: {{item.userMongoId.id}}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-phone</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>Телефон: {{item.userMongoId.phone}}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-android</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>Бот: {{item.userMongoId.bot}}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-account-off</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>Фейковий: {{item.userMongoId.fake}}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-map</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>Геолокація: {{item.userMongoId.location}}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-wechat</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>У чатах: {{item.userMongoId.userChatMessages.length}}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-account-check</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>Веріфркованийи: {{item.userMongoId.verified}}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                <v-btn
                  block
                  @click="openUser(item.userMongoId._id)"
                >Детальніше</v-btn>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </v-data-iterator>
    </v-row>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'Channel-page',
  components: {},
  data() {
    return {};
  },
  methods: {
    ...mapActions([
      'findChannel',
    ]),
    openUser(id) {
      this.$router.push({ name: 'user', params: { id } });
    },
  },
  computed: {
    ...mapGetters([
      'channel',
    ]),
  },
  mounted() {
  },
  created() {
    this.findChannel(this.$route.params.id);
  },
};
</script>

<style>
</style>
