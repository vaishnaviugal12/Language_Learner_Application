<template>
  <v-app>
    <!-- Navbar -->
    <v-app-bar app color="orange darken-2" dark>
      <v-toolbar-title class="font-weight-bold">Language Learner</v-toolbar-title>
    </v-app-bar>

    <!-- Main content -->
    <v-main>
      <v-container class="mt-12">
        <v-row align="center" justify="center">
          <v-col cols="12" md="8" class="text-center">
            <h1 class="text-h3 font-weight-bold orange--text mb-4">
              Welcome to Your Language Learning Journey!
            </h1>
            <p class="subtitle-1 mb-6">
              Explore exciting ways to connect, learn, and track your progress with our interactive features.
            </p>
          </v-col>
        </v-row>

        <!-- Feature Cards -->
        <v-row dense>
          <!-- Connect with Partner -->
          <!-- Connect with Partner -->
<v-col cols="12" md="4" class="mb-6">
  <v-hover v-slot:default="{ hover }">
    <v-card
      :elevation="hover ? 15 : 5"
      class="pa-8 text-center"
      color="orange lighten-5"
      ripple
      @click="$router.push('/match')"
      style="cursor: pointer;"
    >
      <v-avatar size="80" class="mb-4" tile color="orange darken-2">
        <v-icon size="44" color="white">mdi-account-multiple</v-icon>
      </v-avatar>
      <h3 class="headline font-weight-bold mb-2">Connect with Partner</h3>
      <p class="grey--text">
        Instantly find a partner to practice speaking and improve fluency in real-time.
      </p>
    </v-card>
  </v-hover>
</v-col>


          <!-- Learn Words & Phrases -->
          <v-col cols="12" md="4" class="mb-6">
            <v-hover v-slot:default="{ hover }">
              <v-card
                :elevation="hover ? 15 : 5"
                class="pa-8 text-center"
                color="orange lighten-5"
              >
                <v-avatar size="80" class="mb-4" tile color="orange darken-2">
                  <v-icon size="44" color="white">mdi-book-open-page-variant</v-icon>
                </v-avatar>
                <h3 class="headline font-weight-bold mb-2">Learn Words & Phrases</h3>
                <p class="grey--text">
                  Expand your vocabulary daily with curated words and phrases for all levels.
                </p>
              </v-card>
            </v-hover>
          </v-col>

          <!-- See Your Progress -->
         
<v-col cols="12" md="4" class="mb-6">
  <v-hover v-slot:default="{ hover }">
    <v-card
      :elevation="hover ? 15 : 5"
      class="pa-8 text-center"
      color="orange lighten-5"
      ripple
      @click="$router.push('/progress')"
      style="cursor: pointer;"
    >
      <v-avatar size="80" class="mb-4" tile color="orange darken-2">
        <v-icon size="44" color="white">mdi-chart-line</v-icon>
      </v-avatar>
      <h3 class="headline font-weight-bold mb-2">See Your Progress</h3>
      <p class="grey--text">
        Track your learning journey with detailed insights and metrics over time.
      </p>
    </v-card>
  </v-hover>
</v-col>

        </v-row>
      </v-container>

      <!-- Spacer pushes footer to bottom -->
      <v-spacer></v-spacer>
    </v-main>

    <!-- Sticky Footer -->
    <v-footer color="orange darken-2" dark app>
      <v-container>
        <v-row justify="center" class="py-4">
          <span>&copy; {{ new Date().getFullYear() }} Language Learner. All rights reserved.</span>
        </v-row>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: "FeaturesPage",
};
</script>
