<template>
  <v-container class="d-flex justify-center align-center" style="min-height: 90vh;">
    <v-card class="pa-6 text-center" max-width="500">
      <v-card-title class="headline font-weight-bold">
        Find a Learning Partner
      </v-card-title>

      <v-card-text>
        <div v-if="!searching && !partnerFound">
          <p class="subtitle-1 grey--text">
            Click the button below to start finding a partner to practice with.
          </p>
        </div>

        <div v-if="searching">
          <v-progress-circular indeterminate color="orange" size="60"></v-progress-circular>
          <p class="mt-3 orange--text">Searching for a partner...</p>
        </div>

        <div v-if="partnerFound">
          <p class="headline font-weight-medium green--text">
            🎉 Partner Found!
          </p>
          <p class="subtitle-1">Redirecting you to the call...</p>
        </div>
      </v-card-text>

      <v-card-actions class="justify-center" v-if="!searching && !partnerFound">
        <v-btn color="orange darken-2" dark @click="findPartner">
          <v-icon left>mdi-account-search</v-icon>
          Find Partner
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { initSocket } from "../services/socket";

export default {
  name: "MatchPage",
  data() {
    return {
      searching: false,
      partnerFound: false,
      partnerData: null,
      socket: null,
    };
  },
  computed: {
    userId() {
      return this.$store.state.user?._id;
    },
  },
  mounted() {
    if (this.userId) {
      this.socket = initSocket();
      this.registerSocketEvents();
    } else {
      console.error("User not authenticated, redirecting to login.");
      this.$router.push({ name: "Login" });
    }
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.off("matchFound");
      this.socket.off("waiting");
      this.socket.disconnect();
    }
  },
  methods: {
    findPartner() {
      if (!this.userId) {
        this.$router.push({ name: "Login" });
        return;
      }
      this.searching = true;
      this.socket.emit("findPartner", this.userId);
    },
    registerSocketEvents() {
      this.socket.on("waiting", () => {
        this.searching = true;
        console.log("Waiting for partner...");
      });

      this.socket.on("matchFound", (data) => {
        console.log("Matched:", data);
        this.searching = false;
        this.partnerFound = true;
        this.partnerData = data;

        setTimeout(() => {
          const isInitiator = data.initiatorId === this.userId;
          this.$router.push({
            name: "Call",
            params: { callId: data.callId },
            query: {
              partnerId: data.partnerId,
              topic: data.topic,
              isInitiator: isInitiator.toString(),
            },
          });
        }, 1500);
      });
    },
  },
};
</script>
