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
              v-model="firstname"
              label="Ім'я"
            ></v-text-field>
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="lastname"
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
          <v-spacer></v-spacer>
          <v-btn
            dark
            flat
            tile
            big
            @click="searchUser"
          >
            Пошук
          </v-btn>
        </v-row>
      </v-container>
    </v-form>
  </v-container>
</template>

<script>

export default {
  name: 'Users-page',
  components: {
  },
  data() {
    return {
      firstname: null,
      lastname: null,
      username: null,
      phone: null,
    };
  },
  methods: {
    searchUser() {
      //
    },
  },
};
</script>
