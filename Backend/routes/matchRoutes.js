import express from 'express';
import { findMatch } from '../controllers/matchController.js';
import userMiddleware from '../middleware/authMiddleware.js';

const matchrouter = express.Router();

matchrouter.get('/find', userMiddleware, findMatch);

export default matchrouter;