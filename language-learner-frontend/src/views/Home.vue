<template>
  <v-app>
    <!-- Top App Bar -->
    <v-app-bar app color="orange darken-2" dark>
      <v-toolbar-title class="font-weight-bold">Language Learner</v-toolbar-title>
      <v-spacer />
      <v-btn text @click="loggedIn ? logout() : goToSignup()">
  {{ loggedIn ? "Logout" : "Sign Up" }}
</v-btn>

    </v-app-bar>

    <!-- Hero Section with Illustration -->
    <v-container class="mt-12">
      <v-row align="center">
        <!-- Left: Text Content -->
        <v-col cols="12" md="6">
          <h1 class="text-h3 font-weight-bold orange--text">
            Learn Languages. Connect with People.
          </h1>
          <p class="subtitle-1 mb-6">
            Improve your fluency through real-time chat and live video calls with learners worldwide.
          </p>
          <v-btn large color="orange darken-2" dark @click="goToMatch">
            <v-icon left>mdi-play-circle-outline</v-icon>
            Get Started
          </v-btn>
        </v-col>

        <!-- Right: Illustration -->
        <v-col cols="12" md="6" class="text-center">
         <v-img
  src="@/assets/hero_image.png"
  contain
  max-width="420"
  class="mx-auto"
/>


        </v-col>
      </v-row>
    </v-container>

    <!-- Feature Cards Section -->
    <v-container class="mt-10">
      <v-row dense>
        <v-col cols="12" md="4">
          <v-hover v-slot:default="{ hover }">
            <v-card
              class="text-center pa-4"
              :elevation="hover ? 10 : 4"
              outlined
            >
              <v-card-text>
                <v-avatar size="60" class="mb-3" color="orange lighten-4">
                  <v-icon color="orange darken-2" size="36">mdi-chat</v-icon>
                </v-avatar>
                <h3 class="headline font-weight-medium">Real-Time Chat</h3>
                <p class="grey--text">
                  Connect instantly with learners worldwide and practice together.
                </p>
              </v-card-text>
            </v-card>
          </v-hover>
        </v-col>

        <v-col cols="12" md="4">
          <v-hover v-slot:default="{ hover }">
            <v-card
              class="text-center pa-4"
              :elevation="hover ? 10 : 4"
              outlined
            >
              <v-card-text>
                <v-avatar size="60" class="mb-3" color="orange lighten-4">
                  <v-icon color="orange darken-2" size="36">mdi-video</v-icon>
                </v-avatar>
                <h3 class="headline font-weight-medium">Video Calls</h3>
                <p class="grey--text">
                  Boost fluency and confidence with face-to-face conversations.
                </p>
              </v-card-text>
            </v-card>
          </v-hover>
        </v-col>

        <v-col cols="12" md="4">
          <v-hover v-slot:default="{ hover }">
            <v-card
              class="text-center pa-4"
              :elevation="hover ? 10 : 4"
              outlined
            >
              <v-card-text>
                <v-avatar size="60" class="mb-3" color="orange lighten-4">
                  <v-icon color="orange darken-2" size="36">mdi-earth</v-icon>
                </v-avatar>
                <h3 class="headline font-weight-medium">Global Learning</h3>
                <p class="grey--text">
                  Immerse yourself in new cultures by connecting with native speakers.
                </p>
              </v-card-text>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script>
import api from "../services/api";
import { clearLogin, isLoggedIn } from "../services/auth";

export default {
  name: "HomePage",
  data: () => ({ loggedIn: false }),
  created() {
    this.loggedIn = isLoggedIn();
  },
  methods: {
    goToSignup() {
      this.$router.push("/register");
    },
    goToMatch() {
    this.$router.push("/match");
    },
    logout() {
      api.post("/user/logout").finally(() => {
        clearLogin();
        this.loggedIn = false;
        this.$router.push("/login");
      });
    },
  },
};
</script>

<style scoped>
</style>
