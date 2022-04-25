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
      <v-toolbar-title>Телеграм Дрочер</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script>

export default {
  name: 'App',

  data() {
    return {
      selectedItem: 1,
      items: [
        { title: 'Про цю штуку', icon: 'mdi-home-variant', link: '/' },
        { title: 'Канали', icon: 'mdi-television-classic', link: 'channels' },
        { title: 'Користувачі', icon: 'mdi-emoticon-poop', link: 'users' },
        { title: 'Мапа', icon: 'mdi-map', link: 'map' },
      ],
      right: null,
    };
  },
  computed: {
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
};
</script>
