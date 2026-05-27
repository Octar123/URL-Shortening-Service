import { redisClient } from "../config/redis";
import { generateShortKey } from "./keyGenerationService";

const UNUSED_POOL = 'kgs:unused';
const batchSize = 5000;
const threshold = 2000;
const LOCK_KEY = 'kgs:refill_lock';

export const checkAndRefillPool = async () => {
    try{
        const currentSize = await redisClient.sCard(UNUSED_POOL);
        console.log(`[KGS Logger] Current pool size: ${currentSize}`);

        if(currentSize < threshold){

            const acquiredLock = await redisClient.set(LOCK_KEY, 'locked', {
                condition: 'NX',
                expiration: 10
            })

            if(!acquiredLock){
                console.log(`[KGS Logger] Another process is already filling the pool.`);
                return;
            }

            console.log(`[KGS Logger] Pool low, Refilling keys`);

            let freshKeysSet = new Set();

            while(freshKeysSet.size < batchSize){
                freshKeysSet.add(generateShortKey());
            }

            const freshKeys = Array.from(freshKeysSet);

            await redisClient.sAdd(UNUSED_POOL, freshKeys);
            console.log(`[KGS Logger] Pool replenished successfully`);

            await redisClient.del(LOCK_KEY);
        }
    }catch(error){
        console.error(`[KGS Logger] Failed to refill pool: ${error}`);
        await redisClient.del(LOCK_KEY).catch(() => {});
    }
}