import mongoose from "mongoose";
import { redisClient } from "./redis.js";
import Url from "../model/Url.js";

const USED_POOL = 'kgs:used'

export const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);

        const usedPoolSize = await redisClient.sCard(USED_POOL);
        
        if (usedPoolSize === 0) {
            console.log(`[Recovery System] Redis used pool is empty! Rebuilding from MongoDB...`);

            const activeMappings = await Url.find({}, { shortUrlId: 1, _id: 0 }).lean();

            if (activeMappings.length > 0) {
                const keysToRestore = activeMappings.map(doc => doc.shortUrlId);
                
                await redisClient.sAdd(USED_POOL, keysToRestore);
                console.log(`[Recovery System] Successfully restored ${keysToRestore.length} keys to Redis.`);
            } else {
                console.log(`[Recovery System] No active records found in MongoDB. Clean slate.`);
            }
        }
    }catch(error){
        console.error(`Database Connection error: ${error.message}`);
        process.exit(1);
    }
}