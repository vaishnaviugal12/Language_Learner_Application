<template>
  <v-container class="pa-6">
    <!-- Overview Card -->
    <v-row>
      <v-col cols="12">
        <v-card class="pa-4 mb-4">
          <v-row>
            <v-col cols="12" md="4">
              <v-subheader>Average Rating</v-subheader>
              <v-rating :value="averageRating" color="yellow" dense readonly></v-rating>
              <div>{{ averageRating }} ⭐</div>
            </v-col>
            <v-col cols="12" md="4">
              <v-subheader>Total Calls</v-subheader>
              <div>{{ totalCalls }}</div>
            </v-col>
            <v-col cols="12" md="4">
              <v-subheader>Total Ratings</v-subheader>
              <div>{{ totalRatings }}</div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Ratings List -->
    <v-row>
      <v-col cols="12" v-if="ratings.length === 0">
        <v-card class="pa-4 mb-3">
          <div>No ratings yet.</div>
        </v-card>
      </v-col>

      <v-col cols="12" v-for="rating in ratings" :key="rating._id">
        <v-card class="pa-4 mb-3">
          <v-row>
            <v-col cols="12" md="3">
              <v-subheader>From</v-subheader>
              {{ rating.raterId?.username || "Unknown" }}
            </v-col>

            <v-col cols="12" md="3">
              <v-subheader>Rating</v-subheader>
              <v-rating :value="rating.rating" color="yellow" dense readonly></v-rating>
              <div>{{ rating.rating }} ⭐</div>
            </v-col>

            <v-col cols="12" md="4" v-if="rating.comment">
              <v-subheader>Comment</v-subheader>
              {{ rating.comment }}
            </v-col>

            <v-col cols="12" md="2">
              <v-subheader>Date</v-subheader>
              {{ new Date(rating.createdAt).toLocaleString() }}
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import api from "../services/api";

export default {
  name: "ProgressPage",
  data() {
    return {
      ratings: [],
      averageRating: 0,
      totalRatings: 0,
      totalCalls: 0,
      userId: null,
    };
  },
  async mounted() {
    // Wait for user data from store
    this.userId = this.$store.state.user?._id;

    if (!this.userId) {
      this.$router.push("/login");
      return;
    }

    await this.fetchRatings();
    await this.fetchUserStats();
  },
  methods: {
    async fetchRatings() {
      try {
        const res = await api.get(`/ratings/${this.userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        console.log("Ratings response:", res.data); // debug
        this.ratings = res.data.ratings || [];
        this.averageRating = res.data.average || 0;
        this.totalRatings = res.data.total || 0;
      } catch (err) {
        console.error("Error fetching ratings:", err);
      }
    },

    async fetchUserStats() {
      try {
        const res = await api.get(`/users/${this.userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        console.log("User stats response:", res.data); // debug
        this.totalCalls = res.data.totalCalls || 0;
      } catch (err) {
        console.error("Error fetching user stats:", err);
      }
    },
  },
};
</script>
