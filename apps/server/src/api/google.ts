import type { Request, Response } from 'express';
import { google as googleApi, oauth2_v2 } from 'googleapis';

import { GoogleAuthConfig } from '../config';

const scopes = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
];

export type GoogleUser = {
  id: string;
  email: string;
  name: string;
  picture: string;
};

class GoogleApi {
  private oauth2Client;
  private oauth2: oauth2_v2.Oauth2 | null = null;

  constructor() {
    this.oauth2Client = new googleApi.auth.OAuth2(
      GoogleAuthConfig.clientID,
      GoogleAuthConfig.clientSecret,
      GoogleAuthConfig.redirectUrl,
    );
  }

  public authorize = (request: Request, response: Response) => {
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
    response.redirect(authUrl);
  };

  public excahngeCode = async (request: Request): Promise<void> => {
    const code = request.query?.['code'] as string;

    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      this.oauth2 = googleApi.oauth2({
        version: 'v2',
        auth: this.oauth2Client,
      });
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw error;
    }
  };

  public getUser = async (): Promise<oauth2_v2.Schema$Userinfo | null> => {
    if (!this.oauth2) {
      return null;
    }

    try {
      return (await this.oauth2.userinfo.get()).data;
    } catch (error) {
      console.error('Error fetching Google user:', error);
      throw error;
    }
  };
}

const google = new GoogleApi();

export default google;
