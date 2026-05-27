import { redisClient } from "../config/redis";
import Url from "../model/Url";

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

        const urlMapping = await Url.findOne({shortUrlId});

        if(!urlMapping){
            return res.status(404).send('<h1>URL Not Found or Expired</h1>');
        }

        await redisClient.set(cachedKey, urlMapping.originalUrl, {
            expiration: CACHE_TTL
        });

        return res.redirect(urlMapping.originalUrl);
    }catch(err){
        console.error(`[Redirect Controller] : ${err}`);
        return res.status(500).json({error: 'Internal Server error'});
    }
}