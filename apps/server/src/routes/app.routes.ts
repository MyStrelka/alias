import { Router } from 'express';

import apiRoutes from './api.routes';
import oauthRoutes from './oauth/oauth.routes';

const router = Router();

router.use('/oauth', oauthRoutes);
router.use('/api', apiRoutes);

export default router;
