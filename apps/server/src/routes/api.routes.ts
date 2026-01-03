import { Router } from 'express';

import { fetchAiStream } from '../api/ai-studio';
import firebaseAdmin from '../api/firebase-admin';
import { modifyCustomWords } from '../services/game';

const router = Router();

router.post('/user', async (request, response) => {
  const user = request.body;

  const recordId = await firebaseAdmin.insertOrUpdateUser({
    ...user,
    id: user.id || user.deviceId,
    providerId: user.providerId || 'anonim',
  });
  response.status(200).send({ recordId });
});

router.get('/ai-generate', async (request, response) => {
  const roomId = request.query?.['roomId'];
  const topic = request.query?.['topic'];

  let words: string[] = [];
  if (roomId && topic) {
    words = await fetchAiStream(`${topic}`);
    modifyCustomWords(`${roomId}`, `${topic}`, words);
  }

  console.log('/ai-generate: ', topic, words);
  response.status(200).send('OK');
});

export default router;
