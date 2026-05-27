import { redisClient } from "../config/redis";
import Url from "../model/Url";
import { checkAndRefillPool } from "../services/refillPool";

const UNUSED_POOL = 'kgs:unused';
const USED_POOL = 'kgs:used';

export const shortenUrl = async(req, res) => {
    const {long_url, custom_alias, expiry_date} = req.body;

    if(!long_url) return res.status(400).json({error: 'long_url is required'});

    try{
        let shortUrlId;

        if(custom_alias){
            shortUrlId = custom_alias.trim();

            if(!/^[a-zA-Z0-9_-]{4,15}$/.test(shortUrlId)){
                return res.status(400).json({error: 'Custom alais must be 4-15 character long and contains only letters, numbers, hyphens and underscore.'})
            }

            // const existingAlais = await Url.findOne({shortUrlId});
            const existingAlais = await redisClient.sIsMember(USED_POOL, shortUrlId); 
            if(existingAlais){
                return res.status(409).json({error: 'Custom alais is already taken'});
            }

            await redisClient.sAdd(USED_POOL, shortUrlId);
        }else{
            let looping = true;
            while(looping){

                shortUrlId = await redisClient.sPop(UNUSED_POOL);
                
                if(!shortUrlId){
                    checkAndRefillPool().catch(err => console.error(`Background refilling failed: ${err}`));
                    return res.status(503).json({error: 'Sorry for Inconvineance, Service is Temporarily Busy'});
                }
                
                const isUsed = await redisClient.sIsMember(USED_POOL, shortUrlId);
                if(!isUsed){
                    looping = false;
                }
            }
            checkAndRefillPool().catch(err => console.error(`Background refilling failed: ${err}`));

            await redisClient.sAdd(USED_POOL, shortUrlId);
        }

        let expiresAt;
        if(expiry_date){
            expiresAt = new Date(expiry_date);

            if(isNaN(expiry_date) || expiresAt <= new Date()){
                return res.status(400).json({error: 'Expiry must be valid future timestamp'});
            }
        }else{
            expiresAt = undefined;
        }

        const newUrlMapping = await Url.create({
            shortUrlId,
            originalUrl: long_url,
            expiresAt
        });

        const baseURL = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const shortenUrl = `${baseURL}/${newUrlMapping.shortUrl}`;

        return res.status(201).json({
            message: 'URL shortened successfully',
            shortURL: shortenUrl,
            originalURL: newUrlMapping.originalUrl,
            expiresAt: newUrlMapping.expiresAt
        });
    }catch(err){
        console.error(`[Controller] Error: ${err}`);


        if (error.code === 11000) {
            return res.status(409).json({ error: 'Short URL key collision occurred. Please try again.' });
        }

        return res.status(500).json({ error: 'Internal Server Error' });
    }
}