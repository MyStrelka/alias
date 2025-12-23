import { Router } from 'express';

const router = Router();

router.get('/user', async (request, response) => {
  response.status(200).send('{"user": {"id": 123, "name": "Test User"}}');
});

export default router;
