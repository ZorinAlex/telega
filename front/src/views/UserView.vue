<template>
  <v-container v-if="user">
    <v-card>
      <v-card-title class="subheading font-weight-bold">
        {{ user.firstName }} {{ user.lastName }}
      </v-card-title>
      <v-card-text>
        Нік: {{ user.username }}
      </v-card-text>
      <v-divider></v-divider>
      <v-row>
        <v-col cols="12"
               sm="6"
               md="6"
               lg="6">
          <v-list dense>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-key</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>id: {{user.id}}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-phone</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Телефон: {{user.phone}}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-android</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Бот: {{user.bot}}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-account-off</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Фейковий: {{user.fake}}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
        <v-col cols="12"
               sm="6"
               md="6"
               lg="6">
          <v-list dense>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-map</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Геолокація: {{user.location}}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-wechat</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>У чатах: {{user.userChatMessages.length}}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-account-box-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Фото: {{user.photos.length}}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-account-check</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Веріфркованийи: {{user.verified}}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
      </v-row>
    </v-card>
    <v-expansion-panels>
      <v-expansion-panel
        v-for="chat in user.userChatMessages"
        :key="chat._id"
      >
        <v-expansion-panel-header>
            <div>
              Чат: {{chat.chatMongoId.title}}
            </div>
            <div>
              {{chat.chatMongoId.username}}
            </div>
            <div>
              Користувачі: {{chat.chatMongoId.usersCount}}
            </div>
            <div>
              Повідомлення: {{chat.messagesCount}}
            </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-list flat>
              <v-list-item
                v-for="message in chat.messages"
                :key="message._id"
              >
                <v-list-item-content>
                  <v-list-item-subtitle>
                    {{new Date(message.date * 1000)
                    .toLocaleString(undefined, {
                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}}
                  </v-list-item-subtitle>
                  <div >{{message.message}}</div>
                </v-list-item-content>
              </v-list-item>
          </v-list>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'User-page',
  components: {
  },
  data() {
    return {
    };
  },
  methods: {
    ...mapActions([
      'findUser',
    ]),
  },
  computed: {
    ...mapGetters([
      'user',
    ]),
  },
  mounted() {
  },
  created() {
    this.findUser({ id: this.$route.params.id, fullData: true });
  },
};
</script>
