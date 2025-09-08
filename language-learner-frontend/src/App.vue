<template>
  <v-app>
    <router-view v-if="ready" />
  </v-app>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "App",
  data() {
    return { ready: false };
  },
  async created() {
    await this.fetchUser({ $cookies: this.$cookies });
    this.ready = true;
  },
  methods: {
    ...mapActions(["fetchUser"]),
  },
};
</script>
