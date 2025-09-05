<template>
  <v-container class="d-flex justify-center align-center" style="min-height: 100vh;">
    <v-card class="pa-5 mx-auto" max-width="400">
      <v-card-title class="headline">Register</v-card-title>
      <v-card-text>
        <v-text-field v-model="username" label="Username" outlined></v-text-field>
        <v-text-field v-model="email" label="Email" outlined></v-text-field>
        <v-text-field v-model="password" label="Password" type="password" outlined></v-text-field>
        <v-select v-model="nativeLanguage" :items="languages" label="Native Language" outlined></v-select>
        <v-text-field v-model="learningLanguage" label="Learning Language" outlined></v-text-field>
        <v-text-field v-model="knownLanguage" label="Known Language" outlined></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-btn color="success" @click="register">Register</v-btn>
      </v-card-actions>
      <div class="text-center mt-2">
        Already have an account? 
        <router-link to="/login">Login</router-link>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import api from "../services/api";

export default {
  name: "RegisterPage",
  data: () => ({
    username: "",
    email: "",
    password: "",
    nativeLanguage: "",
    learningLanguage: "",
    knownLanguage: "",
    languages: ["English", "Spanish", "French", "German", "Japanese", "Chinese", "Hindi", "Arabic"],
  }),
  methods: {
    async register() {
      try {
        await api.post("/user/register", {
          username: this.username,
          email: this.email,
          password: this.password,
          nativeLanguage: this.nativeLanguage,
          learningLanguage: this.learningLanguage,
          knownLanguage: this.knownLanguage,
        });
        alert("Registration successful! Please login.");
        this.$router.push("/login");
      } catch (err) {
        alert(err.response?.data?.error || "Registration failed");
      }
    },
  },
};
</script>

