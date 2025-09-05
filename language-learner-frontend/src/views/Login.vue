<template>
  <v-container class="d-flex justify-center align-center" style="min-height: 100vh;">
    <v-card class="pa-5 mx-auto" max-width="400">
      <v-card-title class="headline">Login</v-card-title>
      <v-card-text>
        <v-text-field v-model="email" label="Email" outlined></v-text-field>
        <v-text-field v-model="password" label="Password" type="password" outlined></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="login">Login</v-btn>
      </v-card-actions>
      <div class="text-center mt-2">
        New user? 
        <router-link to="/register">Create account</router-link>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import api from "../services/api";
import { setLoggedIn } from "../services/auth";

export default {
  name: "LoginPage",
  data: () => ({
    email: "",
    password: "",
  }),
  methods: {
    async login() {
      try {
        await api.post("/user/login", {
          email: this.email,
          password: this.password,
        });
        setLoggedIn(true);
        this.$router.push("/");
      } catch (err) {
        alert(err.response?.data?.error || "Login failed");
      }
    },
  },
};
</script>

