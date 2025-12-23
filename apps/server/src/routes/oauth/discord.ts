import { Router } from 'express';

import type { User } from '@alias/shared';

import discord from '../../api/discord';
import fireabsese from '../../api/firebase-admin';

const router = Router();

router.get('/login', discord.authorize);

router.get('/callback', async (request, response) => {
  try {
    const tokenResponse = await discord.requestToken(request);
    if (tokenResponse) {
      const userResponse = await discord.getUser(request);
      if (userResponse) {
        const user: User = {
          id: `discord_${userResponse.id}`,
          name: userResponse.username,
          email: userResponse.email,
          providerId: 'discord',
          avatar: userResponse.avatar || '',
        };
        const userId = await fireabsese.insertOrUpdateUser(user);
        console.log('User inserted/updated with ID:', userId);
        const avatarBase64 = await discord.getAvatarBase64(
          userResponse.id,
          userResponse.avatar,
        );
        response
          .status(200)
          .send(
            getCallbackHtml({ ...user, avatar: avatarBase64 || user.avatar }),
          );
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

const getCallbackHtml = (user: User) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>SeaBornShow</title>
        <style>
            body { font-family: sans-serif; background: #0f172a; color: white; padding: 2rem; }
        </style>
    </head>
    <body>
        <script>
            const closeWindow = (user) => {
                window.opener.postMessage({user}, '*');
                window.close();
            }

            const user = ${JSON.stringify(user)};
            closeWindow(user);
        </script>
    </body>
    </html>
  `;

export default router;
