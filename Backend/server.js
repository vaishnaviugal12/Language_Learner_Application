import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import redisClient from './config/redis.js';
import { main } from './config/db.js';
import userRouter from './routes/userRouter.js'; // Uncommented and added
import matchrouter from './routes/matchRoutes.js';
import iceRouter from './routes/iceRoutes.js';
import callSocket from './socket/callSocket.js';
import http from "http";

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:8080", // adjust based on frontend port
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/user", userRouter); // Mount user routes
app.use("/api/match",matchrouter); // matching the suer
app.use("/api/ice-servers", iceRouter);

// Create HTTP server to attach Socket.IO
const server = http.createServer(app);

// Socket.IO setup
import { Server } from "socket.io";
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:8080",
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Initialize socket logic
callSocket(io);


// Initialize Redis and MongoDB
const InitializeConnection = async () => {
  try {
    await Promise.all([main(), redisClient.connect()]);
    console.log("DB connected");
    console.log("Redis connected");

    server.listen(process.env.PORT, () => {
      console.log("Server listening at the port: " + process.env.PORT);
    });

  } catch (error) {
    console.log("Error occurred: " + error);
  }
};

InitializeConnection();














