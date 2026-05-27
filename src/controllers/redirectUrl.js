import { redisClient } from "../config/redis.js";
import Url from "../model/Url.js";

const CACHE_PREFIX = 'cache:url:';
const CACHE_TTL = 86400; // for 24 hours; given in second

export const redirectURL = async(req, res) => {
    const {shortUrlId} = req.params;

    try{
        const cachedKey = `${CACHE_PREFIX}${shortUrlId}`;

        const cachedURL = await redisClient.get(cachedKey);
        if(cachedURL){
            return res.redirect(cachedURL);
        }

        // const dbStart = performance.now();

        const urlMapping = await Url.findOne({shortUrlId});

        if(!urlMapping){
            return res.status(404).send('<h1>URL Not Found or Expired</h1>');
        }
        
        redisClient.set(cachedKey, urlMapping.originalUrl, {
            expiration: {
                type: 'EX',
                value: CACHE_TTL
            }
        });
        
        // const dbEnd = performance.now();
        // console.log(`Pure MongoDB Lookup time: ${(dbEnd - dbStart).toFixed(2)} ms`);
        return res.redirect(urlMapping.originalUrl);
    }catch(err){
        console.error(`[Redirect Controller] : ${err}`);
        return res.status(500).json({error: 'Internal Server error'});
    }
}