import { Router } from 'express';

import type { User } from '@alias/shared';

import discord from '../../api/discord';
import fireabsese from '../../api/firebase-admin';
import { getCallbackHtml } from './callbackHtml';

const router = Router();

router.get('/login', discord.authorize);

router.get('/callback', async (request, response) => {
  try {
    const tokenResponse = await discord.requestToken(request);
    if (tokenResponse) {
      const userResponse = await discord.getUser(request);
      if (userResponse) {
        const user: User = {
          id: userResponse.id,
          name: userResponse.username,
          playerName: userResponse.username,
          email: userResponse.email,
          providerId: 'discord',
          avatar: `https://cdn.discordapp.com/avatars/${userResponse.id}/${userResponse.avatar}.png?size=128`,
        };
        await fireabsese.insertOrUpdateUser(user);

        response.status(200).send(getCallbackHtml(user));
      } else {
        console.log('No user data received.');
        response.status(500).send('Failed to fetch user data from Discord.');
      }
    } else {
      console.log('No token response received.');
      response
        .status(500)
        .send(
          'Failed to authenticate with Discord. No token response received.',
        );
    }
  } catch (error) {
    console.error('Error during Discord OAuth callback:', error);
    response.status(500).send('Failed to authenticate with Discord');
  }
});

export default router;
