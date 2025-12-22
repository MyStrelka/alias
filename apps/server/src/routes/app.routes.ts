import { Router } from 'express';

import oauthRoutes from './oauth/oauth.routes';

const router = Router();

router.use('/oauth', oauthRoutes);

export default router;
