import { Router } from 'express';

import discordAuth from './discord';
import googleAuth from './google';

const router = Router();

router.use('/discord', discordAuth);
router.use('/google', googleAuth);

export default router;
