import { redisClient } from "../config/redis";
import { generateShortKey } from "./keyGenerationService";

const UNUSED_POOL = 'kgs:unused';
const batchSize = 5000;
const threshold = 2000;

export const checkAndRefillPool = async () => {
    try{
        const currentSize = await redisClient.sCard(UNUSED_POOL);
        console.log(`[KGS Logger] Current pool size: ${currentSize}`);

        if(currentSize < threshold){
            console.log(`[KGS Logger] Pool low, Refilling keys`);

            let freshKeys = [];

            for(let i = 0; i < batchSize; i++){
                freshKeys.push(generateShortKey());
            }

            await redisClient.sAdd(UNUSED_POOL, freshKeys);
            console.log(`[KGS Logger] Pool replenished successfully`);
        }
    }catch(error){
        console.error(`[KGS Logger] Failed to refill pool: ${error}`)
    }
}