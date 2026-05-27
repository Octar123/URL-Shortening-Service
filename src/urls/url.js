import express from 'express';
import { shortenUrl } from '../controllers/urlShorten.js';
import { redirectURL} from '../controllers/redirectUrl.js';

const router = express.Router();

router.post('/shorten', shortenUrl);

router.get('/:shortUrlId', redirectURL);

export default router;