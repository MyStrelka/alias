import { Router } from 'express';

import type { User } from '@alias/shared';

import fireabsese from '../../api/firebase-admin';
import google from '../../api/google';
import { getCallbackHtml } from './callbackHtml';

const router = Router();

router.get('/login', google.authorize);

router.get('/callback', async (request, response) => {
  try {
    await google.excahngeCode(request);

    const userResponse = await google.getUser();
    if (userResponse) {
      const { id, name, email, picture } = userResponse;
      const user: User = {
        id: id || 'empty_callbac_kuser_response',
        name: name || '',
        nickName: name || '',
        email: email || '',
        providerId: 'google',
        avatar: picture || '',
      };
      const userId = await fireabsese.insertOrUpdateUser(user);
      console.log('User inserted/updated with ID:', userId);

      response.status(200).send(getCallbackHtml(user));
    } else {
      console.log('No user data received.');
      response.status(500).send('Failed to fetch user data from Google.');
    }
  } catch (error) {
    console.error('Error during Google OAuth callback:', error);
    response.status(500).send('Failed to authenticate with Google');
  }
});

export default router;
