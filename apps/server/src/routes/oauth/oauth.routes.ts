import { Router } from 'express';

import discordAuth from './discord';

const router = Router();

router.use('/discord', discordAuth);

export default router;
