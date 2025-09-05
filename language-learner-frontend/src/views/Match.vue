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
import api from "../services/api";
import socket from "../services/socket";

export default {
  name: "MatchPage",
  data: () => ({
    searching: false,
    partnerFound: false,
  }),
  mounted() {
    // Listen for socket event only once
    socket.on("matchFound", (data) => {
      this.searching = false;
      this.partnerFound = true;

      // Save match info (optional)
      localStorage.setItem("match", JSON.stringify(data));

      // Redirect to call after delay
      setTimeout(() => {
        this.$router.push("/call");
      }, 2000);
    });
  },
  methods: {
    async findPartner() {
      try {
        this.searching = true;

        // Option 1: API call
        await api.get("/match/find");

        // Option 2: Or socket event
        socket.emit("findPartner");
      } catch (err) {
        this.searching = false;
        alert(err.response?.data?.error || "Failed to find partner");
      }
    },
  },
};
</script>

