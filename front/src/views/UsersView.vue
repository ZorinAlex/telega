<template>
  <v-container>
    <v-form>
      <v-container>
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="firstName"
              label="Ім'я"
            ></v-text-field>
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="lastName"
              label="Фамілія"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="username"
              label="Нікнейм"
            ></v-text-field>
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="phone"
              label="Телофон"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-switch
            class="ma-0"
            v-model="withPhoneOnly"
            label="Тільки з телефоном"
            hide-details
          ></v-switch>
          <v-spacer></v-spacer>
          <v-btn
            dark
            tile
            big
            @click="searchUsers(true)"
          >
            Пошук
          </v-btn>
        </v-row>
      </v-container>
    </v-form>
    <v-container fluid class="mt-5 pa-0">
      <v-data-iterator
        :loading="loading"
        :page="currentPage"
        :server-items-length="usersFindCount"
        @update:page = "pageUpdate"
        :items="users"
        :items-per-page="21"
        :footer-props="{
          'items-per-page-options': [21]
        }"
      >
        <template v-slot:header>
          <v-toolbar
            class="mb-2"
            dark
            flat
          >
            <v-toolbar-title>Знайдено {{usersFindCount}} користувачів</v-toolbar-title>
            <v-progress-linear
              :active="loading"
              :indeterminate="loading"
              absolute
              bottom
            ></v-progress-linear>
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
                  {{ item.firstName }} {{ item.lastName }}
                </v-card-title>
                <v-card-text>
                  Повідомлень: {{ item.userChatMessages.length }}
                </v-card-text>
                <v-divider></v-divider>
                <v-list dense>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-account</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>нік: {{item.username}}
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
                      <v-icon>mdi-phone</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>Телефон: {{item.phone}}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-android</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>Бот: {{item.bot}}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-account-off</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>Фейковий: {{item.fake}}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-map</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>Геолокація: {{item.location}}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-wechat</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>У чатах: {{item.userChatMessages.length}}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-icon>
                      <v-icon>mdi-account-check</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-title>Веріфркованийи: {{item.verified}}
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                <v-btn
                  block
                  @click="openUser(item._id)"
                >Детальніше</v-btn>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </v-data-iterator>
      <v-progress-linear
        :active="loading"
        :indeterminate="loading"
        absolute
        bottom
      ></v-progress-linear>
    </v-container>
  </v-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'Users-page',
  components: {
  },
  data() {
    return {
      firstName: null,
      lastName: null,
      username: null,
      phone: null,
      withPhoneOnly: false,
      loading: false,
      skipIterator: 0,
      currentPage: 1,
    };
  },
  methods: {
    ...mapActions([
      'findUsers',
    ]),
    openUser(id) {
      this.$router.push({ name: 'user', params: { id } });
    },
    async pageUpdate(page) {
      this.skipIterator = (page - 1) * 21;
      this.currentPage = page;
      await this.searchUsers();
    },
    async searchUsers(isNew = false) {
      if (isNew) {
        this.currentPage = 1;
        this.skipIterator = 0;
      }
      this.loading = true;
      await this.findUsers({
        firstName: this.firstName,
        lastName: this.lastName,
        username: this.username,
        phone: this.phone,
        withPhoneOnly: this.withPhoneOnly,
        skip: this.skipIterator,
        limit: 21,
      });
      this.loading = false;
    },
  },
  computed: {
    ...mapGetters([
      'users',
      'usersFindCount',
    ]),
  },
};
</script>

<style>
  .v-application--is-ltr .v-data-footer__pagination {
    margin-left: auto;
  }
</style>
