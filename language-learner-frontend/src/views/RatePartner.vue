<template>
  <v-container class="pa-6 text-center">
    <h2>Rate Your Partner</h2>
    <p>Please rate your conversation partner</p>

    <v-rating
      v-model="rating"
      color="yellow"
      background-color="grey darken-1"
      large
    ></v-rating>

    <v-textarea
      v-model="comment"
      label="Leave a comment"
      outlined
      class="mt-4"
    ></v-textarea>

    <div class="mt-4">
      <v-btn color="orange" class="mr-4" @click="submitRating">Submit</v-btn>
      <v-btn color="grey darken-1" @click="skipRating">Skip</v-btn>
    </div>
  </v-container>
</template>

<script>
import api from "../services/api";

export default {
  name: "RatePartner",
  data() {
    return {
      rating: 0,
      comment: "",
    };
  },
  computed: {
    partnerId() {
      return this.$route.query.partnerId;
    },
  },
  methods: {
    async submitRating() {
      try {
        await api.post(
          "/ratings",
          {
            partnerId: this.partnerId,
            rating: this.rating,
            comment: this.comment,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        // ✅ Redirect to Home instead of Progress
        this.$router.push("/");
      } catch (err) {
        console.error("Error submitting rating:", err);
      }
    },
    skipRating() {
      // ✅ Skip also goes to Home
      this.$router.push("/");
    },
  },
};
</script>
