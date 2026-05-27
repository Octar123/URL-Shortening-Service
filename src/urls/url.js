import express from 'express';
import { shortenUrl } from '../controllers/urlShorten';
import { redirectURL} from '../controllers/redirectUrl';

const router = express.Router();

router.post('/shorten', shortenUrl);

router.get('/:shortUrlId', redirectURL);

export default router;