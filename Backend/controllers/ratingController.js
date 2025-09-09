// controllers/ratingController.js
import Rating from "../models/Rating.js";

import User from "../Models/userModel.js";

// --- Add rating after call ---
export const addRating = async (req, res) => {
  try {
    const { partnerId, rating, comment } = req.body;
    const raterId = req.user.id; // from auth middleware

    if (!partnerId || !rating) {
      return res.status(400).json({ message: "Partner ID and rating required" });
    }

    // Save rating
    const newRating = new Rating({ raterId, partnerId, rating, comment });
    await newRating.save();

    res.status(201).json({ message: "Rating saved", rating: newRating });
  } catch (error) {
    res.status(500).json({ message: "Error saving rating", error: error.message });
  }
};

// --- Get all ratings for a user ---
export const getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;

    const ratings = await Rating.find({ partnerId: userId }).populate("raterId", "username email");

    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

    res.json({
      average: avgRating.toFixed(1),
      total: ratings.length,
      ratings,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching ratings", error: error.message });
  }
};
