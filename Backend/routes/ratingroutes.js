// routes/ratingRoutes.js
import express from "express";
import { addRating, getUserRatings } from "../controllers/ratingController.js";
import authMiddleware from "../middleware/authMiddleware.js";


const ratingRoutes = express.Router();

// Add rating after call
ratingRoutes.post("/", authMiddleware, addRating);

// Get ratings for a user (progress page)
ratingRoutes.get("/:userId", authMiddleware, getUserRatings);

export default ratingRoutes;
