<script>
import { mapActions } from "vuex";

export default {
  name: "LoginPage",
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    ...mapActions(["login"]),
    async loginUser() {
      try {
        await this.login({
          email: this.email,
          password: this.password,
          $cookies: this.$cookies,
        });
        this.$router.push("/");
      } catch (err) {
        alert(err.response?.data?.error || "Login failed");
      }
    },
  },
};
</script>

<template>
  <v-container class="d-flex justify-center align-center" style="min-height: 100vh;">
    <v-card class="pa-5 mx-auto" max-width="400">
      <v-card-title>Login</v-card-title>
      <v-card-text>
        <v-text-field v-model="email" label="Email" outlined></v-text-field>
        <v-text-field v-model="password" label="Password" type="password" outlined></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="loginUser">Login</v-btn>
        <v-spacer></v-spacer>
        <router-link to="/register">New user? Register</router-link>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
