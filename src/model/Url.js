import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
    shortUrlId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    originalUrl: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: null,
        index: {expires: 0}
    }
});

export default mongoose.model('Url', urlSchema);