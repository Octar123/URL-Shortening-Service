import mongoose from "mongoose";
import { redisClient } from "./redis.js";
import Url from "../model/Url.js";

const USED_POOL = 'kgs:used'

export const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);

        // Logic to recovery the used keys if the redis fails and the usedPool is empty

        const usedPoolSize = await redisClient.sCard(USED_POOL);
        
        if (usedPoolSize === 0) {
            console.log(`[Recovery System] Redis used pool is empty! Rebuilding from MongoDB...`);

            // lean() is used to optimize the read operation,as if we just use the find() then it will return 
            // a large metdata which takes CPU, using lean() optimizes it
            const activeMappings = await Url.find({}, { shortUrlId: 1, _id: 0 }).lean();

            if (activeMappings.length > 0) {
                const keysToRestore = activeMappings.map(doc => doc.shortUrlId);


                // Logic to prevent a very large data
                const chunkSize = 5000;

                for(let i = 0; i < keysToRestore.length; i += chunkSize){
                    const chunk = keysToRestore.slice(i, i+chunkSize);

                    await redisClient.sAdd(USED_POOL, ...chunk);
                }
                
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