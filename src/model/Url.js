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
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Before just a new date is created which used to take time from startup of the server, but by passing anonymus funciton we calculates at object created
        index: {expires: 0}
    }
});

export default mongoose.model('Url', urlSchema);