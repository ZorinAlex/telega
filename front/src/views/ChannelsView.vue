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
              v-model="name"
              label="Назва"
            ></v-text-field>
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-btn
              dark
              flat
              tile
              big
              @click="searchChannel"
            >
              Пошук
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-container>
</template>

<script>

export default {
  name: 'Channels-page',
  data() {
    return {
      name: null,
    };
  },
  methods: {
    searchChannel() {
      //
    },
  },
};
</script>
