<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        md="4"
      >
        <v-form>
          <v-text-field
            v-model="loginUser"
            label="Лонін"
            required
          ></v-text-field>

          <v-text-field
            v-model="passwordUser"
            label="Пароль"
            required
          ></v-text-field>
          <v-btn
            @click="loginEdi"
          >
            Увійти
          </v-btn>
        </v-form>
      </v-col>
    </v-row>

  </v-container>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'Home-page',
  components: {
  },
  data() {
    return {
      loginUser: '',
      passwordUser: '',
    };
  },
  methods: {
    ...mapActions([
      'login',
    ]),
    loginEdi() {
      this.login({ login: this.loginUser, password: this.passwordUser });
    },
  },
};
</script>
