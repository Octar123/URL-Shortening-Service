import { redisClient } from "../config/redis.js";
import { generateShortKey } from "./keyGenerationService.js";

const UNUSED_POOL = "kgs:unused";
const USED_POOL = "kgs:used";
const batchSize = 5000;
const threshold = 2000;
const LOCK_KEY = "kgs:refill_lock";

export const checkAndRefillPool = async () => {
  try {
    const currentSize = await redisClient.sCard(UNUSED_POOL);
    console.log(`[KGS Logger] Current pool size: ${currentSize}`);
    
    if (currentSize < threshold) {
        const acquiredLock = await redisClient.set(LOCK_KEY, "locked", {
            condition: "NX",
            expiration: {
                type: 'EX',
                value: 10
            },
        });
        // console.log("Bankai")
        
      if (!acquiredLock) {
        console.log(
          `[KGS Logger] Another process is already filling the pool.`,
        );
        return;
      }

      console.log(`[KGS Logger] Pool low, Refilling keys`);

      let freshKeysSet = new Set();

      while (freshKeysSet.size < batchSize) {
        const key = generateShortKey();

        const isAlreadyUsed = await redisClient.sIsMember(USED_POOL, key);
        if (!isAlreadyUsed) {
          freshKeysSet.add(generateShortKey());
        }
      }

      const freshKeys = Array.from(freshKeysSet);

      await redisClient.sAdd(UNUSED_POOL, freshKeys);
      console.log(`[KGS Logger] Pool replenished successfully`);

      await redisClient.del(LOCK_KEY);
    }
  } catch (error) {
    console.error(`[KGS Logger] Failed to refill pool: ${error}`);
    await redisClient.del(LOCK_KEY).catch(() => {});
  }
};

/**Note to use Bloom filer for performance, may consider using later if the links are lower than 5 million, if the total links grow beyond that point consider using the bloom filter. */
