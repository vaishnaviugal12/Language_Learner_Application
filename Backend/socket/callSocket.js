import Call from "../models/call.js";
import User from "../Models/userModel.js";
import { generateTopic } from "../utils/topicGenerator.js";

let onlineUsers = {};

const callSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🔗 New client connected:", socket.id);

    socket.on("register", ({ userId }) => {
      if (!userId) return;
      onlineUsers[userId.toString()] = socket.id;
      console.log(`✅ User ${userId} registered on socket ${socket.id}`);
    });

    socket.on("findPartner", async (userId) => {
      if (!userId) return;
      const currentUser = await User.findById(userId);
      if (!currentUser) return;

      await Call.deleteMany({ status: "waiting", participants: { $in: [userId] } });

      let call = await Call.findOne({ status: "waiting", participants: { $not: { $elemMatch: { $eq: userId } } } });

      if (call) {
        call.participants.push(userId);
        call.status = "ongoing";
        await call.save();
        await User.updateMany({ _id: { $in: call.participants } }, { $set: { isAvailable: false } });

        const partnerId = call.participants.find(p => p.toString() !== userId.toString());

        io.to(socket.id).emit("matchFound", { callId: call._id, partnerId: partnerId.toString(), topic: call.topic, initiatorId: partnerId.toString() });
        const partnerSocketId = onlineUsers[partnerId.toString()];
        if (partnerSocketId) io.to(partnerSocketId).emit("matchFound", { callId: call._id, partnerId: userId, topic: call.topic, initiatorId: partnerId.toString() });
      } else {
        const topic = generateTopic();
        call = await Call.create({ participants: [userId], topic, status: "waiting" });
        io.to(socket.id).emit("waiting", { callId: call._id, topic });
      }
    });

    // WebRTC signaling
    ["offer", "answer", "iceCandidate"].forEach(evt => {
      socket.on(evt, ({ callId, to, ...data }) => {
        if (!to) return;
        const targetSocketId = onlineUsers[to];
        if (targetSocketId) io.to(targetSocketId).emit(evt, { callId, ...data });
      });
    });

    socket.on("chatMessage", (data) => {
      const partnerSocketId = Object.values(onlineUsers).find(id => id !== socket.id);
      if (partnerSocketId) io.to(partnerSocketId).emit("chatMessage", data);
    });

    socket.on("endCall", async ({ callId, userId }) => {
      const call = await Call.findById(callId);
      if (call) {
        call.status = "ended";
        await call.save();
        await User.updateMany({ _id: { $in: call.participants } }, { $set: { isAvailable: true } });
      }
      socket.emit("callEnded");
      call?.participants.forEach(p => {
        if (p.toString() !== userId.toString()) {
          const partnerSocketId = onlineUsers[p.toString()];
          if (partnerSocketId) io.to(partnerSocketId).emit("callEnded");
        }
      });
    });

    socket.on("disconnect", async () => {
      const userId = Object.keys(onlineUsers).find(uid => onlineUsers[uid] === socket.id);
      if (userId) {
        delete onlineUsers[userId];
        await Call.deleteMany({ status: "waiting", participants: [userId] });
      }
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};

export default callSocket;
