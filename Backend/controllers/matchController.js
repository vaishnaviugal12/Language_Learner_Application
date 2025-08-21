// controllers/matchController.js
import User from "../Models/userModel.js";
import Call from "../models/call.js";
import { generateTopic } from "../utils/topicGenerator.js";

export const findMatch = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    const match = await User.findOne({
      _id: { $ne: userId },
      knownLanguage: currentUser.learningLanguage,
      learningLanguage: currentUser.knownLanguage,
      isAvailable: true,
    });

    if (!match) {
      return res.status(404).json({ message: "No match found" });
    }

    // mark unavailable
    currentUser.isAvailable = false;
    match.isAvailable = false;
    await currentUser.save();
    await match.save();

    // create call with generated topic
    const topic = generateTopic(); // simple topic generator
    const call = await Call.create({
      participants: [currentUser._id, match._id],
      topic,
      status: "ongoing", // or "ongoing" when call actually starts; keep here for simplicity
      startTime: null,   // will be set by socket when second user joins or start-call emitted
    });

    res.status(200).json({
      message: "Match found",
      match,
      callId: call._id,
      topic,
    });
  } catch (error) {
    console.error("findMatch error:", error);
    res.status(500).json({ message: error.message });
  }
};
