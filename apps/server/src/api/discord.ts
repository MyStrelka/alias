import btoa from 'btoa';
import type { Request, Response } from 'express';

import { DiscordAuthConfig } from '../config';

const BASE_URL = 'https://discord.com/api';

export type OAuthTokenResponse = {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
};

export type DiscordUser = {
  id: string;
  username: string;
  avatar: string;
  email: string;
};

class DisicordApi {
  private creds: string = '';
  private authorization: string = '';

  constructor() {
    this.creds =
      'Basic ' +
      btoa(`${DiscordAuthConfig.clientID}:${DiscordAuthConfig.clientSecret}`);
  }

  public authorize = (request: Request, response: Response) => {
    response.redirect(DiscordAuthConfig.authorizationURL);
  };

  public requestToken = async (
    request: Request,
  ): Promise<OAuthTokenResponse | null> => {
    const code = request.query?.['code'];
    const updatedParams = new URLSearchParams();
    updatedParams.set('grant_type', 'authorization_code');
    updatedParams.set('redirect_uri', DiscordAuthConfig.redirectUrl);
    updatedParams.set('code', `${code}`);

    const oauthTokenUrl = `${BASE_URL}/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${DiscordAuthConfig.redirectUrl}`;

    let data = null;
    try {
      const resp = await fetch(oauthTokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: this.creds,
        },
        body: updatedParams,
      });
      data = (await resp.json()) as OAuthTokenResponse;
      this.authorization = `Bearer ${data.access_token}`;
    } catch (error) {
      console.error('Error during Discord OAuth callback:', error);
      throw error;
    } finally {
      return data;
    }
  };

  public getUser = async (request: Request): Promise<DiscordUser | null> => {
    let data = null;
    try {
      const resp = await fetch(`${BASE_URL}/users/@me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: this.authorization,
        },
      });

      data = (await resp.json()) as DiscordUser;
    } catch (error) {
      console.error('Error fetching Discord user:', error);
      throw error;
    } finally {
      return data;
    }
  };

  public getAvatarBase64 = async (userId: string, avatarHash: string) => {
    try {
      const url = `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png?size=64`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch: ${response.status} ${response.statusText}`,
        );
      }
      const arrayBuffer = await response.arrayBuffer();

      const buffer = Buffer.from(arrayBuffer);

      const contentType = response.headers.get('content-type');

      const base64String = buffer.toString('base64');

      return `data:${contentType};base64,${base64String}`;
    } catch (error) {
      let errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error fetching avatar with fetch:', errorMessage);
      return null;
    }
  };
}

const discord = new DisicordApi();

export default discord;
