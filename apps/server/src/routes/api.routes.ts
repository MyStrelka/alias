import { Router } from 'express';

import firebaseAdmin from '../api/firebase-admin';

const router = Router();

router.post('/user', async (request, response) => {
  const user = request.body;

  const recordId = await firebaseAdmin.insertOrUpdateUser({
    ...user,
    id: user.id || `anonim_${user.deviceId}`,
    providerId: user.providerId || 'anonim',
  });
  response.status(200).send({ recordId });
});

export default router;
