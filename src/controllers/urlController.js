import { redisClient } from "../config/redis";
import { checkAndRefillPool } from "../services/refillPool";

export const shortenUrl = async(req, res) => {
    const {long_url, custom_alias, expiry_date} = req.body;

    if(!long_url) return res.status(400).json({error: 'long_url is required'});

    
}