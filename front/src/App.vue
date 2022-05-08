<template>
  <v-app>
    <v-navigation-drawer
      app
      dark
      clipped
      permanent
      :mini-variant="mini"
    >
      <v-list
        flat
      >
        <v-list-item-group
          v-model="selectedItem"
          color="blue"
        >
          <v-list-item
            v-for="item in items"
            :key="item.title"
            :to="item.link"
            link
            v-show="canShow(item)"
          >
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      app
      dark
      clipped-left
    >
      <div class="d-flex align-center">
        <v-img
          alt="Logo"
          class="shrink mr-2"
          contain
          src="@/assets/Logo.png"
          transition="scale-transition"
          width="40"
        />
      </div>
      <v-toolbar-title>Телеграм Оркєр</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'App',

  data() {
    return {
      selectedItem: 1,
      items: [
        {
          title: 'Про цю штуку', icon: 'mdi-home-variant', link: '/', protected: false,
        },
        {
          title: 'Канали', icon: 'mdi-television-classic', link: 'channels', protected: false,
        },
        {
          title: 'Користувачі', icon: 'mdi-emoticon-poop', link: 'users', protected: false,
        },
        {
          title: 'Додати локації', icon: 'mdi-google-maps', link: 'map', protected: true,
        },
        {
          title: 'Додати канали', icon: 'mdi-television-guide', link: 'addChannels', protected: true,
        },
      ],
      right: null,
    };
  },
  computed: {
    ...mapGetters([
      'isLogged',
    ]),
    mini() {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          return true;
        case 'sm':
          return true;
        case 'md':
          return true;
        case 'lg':
          return false;
        case 'xl':
          return false;
        default:
          return false;
      }
    },
  },
  methods: {
    ...mapActions([
      'setAuthFromCookies',
    ]),
    canShow(item) {
      if (!item.protected) return true;
      if (this.isLogged) return true;
      return false;
    },
  },
  mounted() {
    this.setAuthFromCookies();
  },
};
</script>
