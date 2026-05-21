import redis from 'redis';

export const redisClient = redis.createClient({
    url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error(`Redis Client error: ${err}`));
redisClient.on('connect', () => console.log('Redis Cache Connected'));

export const connectRedis = async () => {
    if(!redisClient.isOpen){
        await redisClient.connect();
    }
};