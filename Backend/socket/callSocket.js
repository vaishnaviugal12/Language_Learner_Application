// sockets/callSocket.js
import jwt from "jsonwebtoken";
import cookie from "cookie";
import User from "../Models/userModel.js";
import Call from "../models/call.js";

export default function callSocket(io) {
    io.on("connection", async (socket) => {
        console.log("New socket connected:", socket.id);

        // --- Authenticate socket from cookies ---
        try {
            // Parse cookies from the handshake headers
            const cookies = cookie.parse(socket.handshake.headers.cookie || "");
            const token = cookies?.token; // Must match your cookie name in server login

            if (!token) throw new Error("Token missing");

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (!user) throw new Error("User not found");

            socket.userId = user._id.toString();
            console.log(`✅ User ${socket.userId} connected to socket via cookie`);
        } catch (err) {
            console.error("❌ Socket auth error:", err.message);
            socket.emit("error", "Authentication failed");
            socket.disconnect();
            return;
        }

        // --- Join a call room after match ---
        socket.on("join-call", async ({ callId, peerId }) => {
            socket.join(callId);
            socket.callId = callId;

            console.log(`User ${socket.userId} joined call room: ${callId}`);

            // Notify others in the room
            socket.to(callId).emit("user-joined", {
                userId: socket.userId,
                peerId
            });
        });

        // --- WebRTC signaling ---
        socket.on("offer", ({ sdp, to }) => {
            io.to(to).emit("webrtc-offer", { sdp, from: socket.id });
        });

        socket.on("answer", ({ sdp, to }) => {
            io.to(to).emit("webrtc-answer", { sdp, from: socket.id });
        });

        socket.on("candidate", ({ candidate, to }) => {
            io.to(to).emit("ice-candidate", { candidate, from: socket.id });
        });

        // --- Call start ---
        socket.on("start-call", async () => {
            if (!socket.callId) return;

            const call = await Call.findById(socket.callId);
            if (call) {
                call.startedAt = new Date();
                await call.save();
            }

            io.to(socket.callId).emit("call-started", {
                startedAt: call?.startedAt || new Date()
            });

            // Auto end after 15 minutes
            setTimeout(async () => {
                io.to(socket.callId).emit("call-ended", { reason: "time-limit" });

                await endCallCleanup(socket.callId);
            }, 15 * 60 * 1000);
        });

        // --- In-call chat ---
        socket.on("send-message", ({ text }) => {
            if (!socket.callId) return;

            io.to(socket.callId).emit("receive-message", {
                senderId: socket.userId,
                text,
                timestamp: new Date()
            });
        });

        // --- End call manually ---
        socket.on("end-call", async () => {
            if (!socket.callId) return;

            io.to(socket.callId).emit("call-ended", { reason: "user-ended" });
            await endCallCleanup(socket.callId);
        });

        // --- On disconnect ---
        socket.on("disconnect", async () => {
            console.log(`User ${socket.userId} disconnected`);
        });

        // --- Cleanup function ---
        async function endCallCleanup(callId) {
            try {
                const call = await Call.findById(callId);
                if (call) {
                    call.endedAt = new Date();
                    await call.save();

                    // Mark users as available again
                    await User.updateMany(
                        { _id: { $in: [call.caller, call.receiver] } },
                        { isAvailable: true }
                    );
                }
                io.socketsLeave(callId);
            } catch (err) {
                console.error("Error during call cleanup:", err.message);
            }
        }
    });
}
