// models/Call.js
import mongoose from "mongoose";

const callSchema = new mongoose.Schema({
    participants: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    ],
    topic: { type: String,  required: true },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    status: {
        type: String,
        enum: ["waiting" ,"ongoing", "ended"],
        default: "waiting"
    }
}, { timestamps: true });

const Call = mongoose.model('call', callSchema);
export default Call;

