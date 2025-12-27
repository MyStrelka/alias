import 'dotenv/config';

export const FirebaseServiceAccountKey = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    '{"project_id": "", "client_email": "", "private_key": ""}',
);

export const firebaseDatabaseId =
  process.env.FIREBASE_DATABASE_ID || '(default)';

if (
  FirebaseServiceAccountKey.project_id === '' ||
  FirebaseServiceAccountKey.client_email === '' ||
  FirebaseServiceAccountKey.private_key === ''
) {
  console.warn(
    '⚠️ Firebase service account key is not properly set in environment variables.',
  );
}

export const DiscordAuthConfig = {
  authorizationURL: process.env.OAUTH_DISCORD_URL || '',
  clientID: process.env.OAUTH_DISCORD_CLIENT_ID || '',
  clientSecret: process.env.OAUTH_DISCORD_CLIENT_SECRET || '',
  redirectUrl: process.env.OAUTH_DISCORD_REDIRECT_URI || '',
  scopes: (process.env.OAUTH_DISCORD_SCOPE || '').split(','),
};

export const GoogleAuthConfig = {
  clientID: process.env.OAUTH_GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET || '',
  redirectUrl: process.env.OAUTH_GOOGLE_REDIRECT_URI || '',
};
