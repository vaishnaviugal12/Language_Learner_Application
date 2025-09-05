// controllers/matchController.js
import User from "../Models/userModel.js";
import Call from "../models/call.js";
import { generateTopic } from "../utils/topicGenerator.js";

export const findMatch = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    // Look for waiting call
    let call = await Call.findOne({
      status: "waiting",
      "participants.0": { $ne: userId }, 
    }).populate("participants");

    if (call) {
      // second user joins
      call.participants.push(currentUser._id);
      call.status = "ongoing";
      await call.save();

      currentUser.isAvailable = false;
      await currentUser.save();

      return res.status(200).json({
        message: "Match found 🎉",
        match: call.participants.find(p => p._id.toString() !== userId.toString()),
        callId: call._id,
        topic: call.topic,   // 🔥 always return saved topic
      });
    }

    // First user creates new call
    const topic = generateTopic(); // only here!
    call = await Call.create({
      participants: [currentUser._id],
      topic,
      status: "waiting",
      startTime: null,
    });

    currentUser.isAvailable = false;
    await currentUser.save();

    return res.status(200).json({
      message: "Waiting for match",
      callId: call._id,
      topic: call.topic,   // 🔥 return the same saved topic
    });
  } catch (error) {
    console.error("findMatch error:", error);
    res.status(500).json({ message: error.message });
  }
};
