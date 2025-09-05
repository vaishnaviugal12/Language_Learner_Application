// sockets/callSocket.js
import Call from "../models/call.js";
import User from "../Models/userModel.js";
import { generateTopic } from "../utils/topicGenerator.js";

let onlineUsers = {}; // socketId -> userId

const callSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🔗 New client connected:", socket.id);

    // ✅ Register user when connected
    socket.on("register", async (userId) => {
      onlineUsers[socket.id] = userId;
      console.log(`✅ User ${userId} registered on socket ${socket.id}`);
    });

    // ✅ Find a partner
    socket.on("findPartner", async (userId) => {
      try {
        const currentUser = await User.findById(userId);
        if (!currentUser) return;

        // Look for a waiting call
        let call = await Call.findOne({
          status: "waiting",
          "participants.0": { $ne: userId },
        }).populate("participants");

        if (call) {
          // Second user joins
          call.participants.push(userId);
          call.status = "ongoing";
          await call.save();

          const topic = call.topic;

          const partnerId = call.participants.find(
            (p) => p.toString() !== userId.toString()
          );

          // Notify both users
          io.to(socket.id).emit("matchFound", {
            callId: call._id,
            partnerId,
            topic,
          });

          const partnerSocketId = getSocketIdByUserId(partnerId);
          if (partnerSocketId) {
            io.to(partnerSocketId).emit("matchFound", {
              callId: call._id,
              partnerId: userId,
              topic,
            });
          }
        } else {
          // Create a new call
          const topic = generateTopic();
          call = await Call.create({
            participants: [userId],
            topic,
            status: "waiting",
          });

          io.to(socket.id).emit("waiting", {
            callId: call._id,
            topic,
          });
        }
      } catch (error) {
        console.error("findPartner error:", error);
      }
    });

    // ✅ WebRTC Signaling
    socket.on("offer", ({ callId, offer, to }) => {
      const targetSocketId = getSocketIdByUserId(to);
      if (targetSocketId)
        io.to(targetSocketId).emit("offer", { callId, offer });
    });

    socket.on("answer", ({ callId, answer, to }) => {
      const targetSocketId = getSocketIdByUserId(to);
      if (targetSocketId)
        io.to(targetSocketId).emit("answer", { callId, answer });
    });

    socket.on("iceCandidate", ({ callId, candidate, to }) => {
      const targetSocketId = getSocketIdByUserId(to);
      if (targetSocketId)
        io.to(targetSocketId).emit("iceCandidate", { callId, candidate });
    });

    // ✅ End Call
    socket.on("endCall", async ({ callId, userId }) => {
      try {
        const call = await Call.findById(callId);
        if (call) {
          call.status = "ended";
          await call.save();
        }
        io.to(socket.id).emit("callEnded");

        call?.participants.forEach((p) => {
          if (p.toString() !== userId.toString()) {
            const partnerSocketId = getSocketIdByUserId(p);
            if (partnerSocketId) io.to(partnerSocketId).emit("callEnded");
          }
        });
      } catch (error) {
        console.error("endCall error:", error);
      }
    });

    // ✅ Disconnect
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
      delete onlineUsers[socket.id];
    });
  });

  const getSocketIdByUserId = (userId) => {
    return Object.keys(onlineUsers).find(
      (sid) => onlineUsers[sid] === userId.toString()
    );
  };
};

export default callSocket;
