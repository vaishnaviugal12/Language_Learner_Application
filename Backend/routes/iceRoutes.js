import express from "express";
import { getIceServers } from "../controllers/iceController.js";
//import userMiddleware from "../middleware/authMiddleware.js";

const iceRouter = express.Router();
iceRouter.get("/get", getIceServers);
export default iceRouter;