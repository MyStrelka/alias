import 'dotenv/config';

export const FirebaseServiceAccountKey = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    '{"project_id": "", "client_email": "", "private_key": ""}',
);
if (
  FirebaseServiceAccountKey.project_id === '' ||
  FirebaseServiceAccountKey.client_email === '' ||
  FirebaseServiceAccountKey.private_key === ''
) {
  console.warn(
    '⚠️ Firebase service account key is not properly set in environment variables.',
  );
}

export const FirebaseConfig = {
  apiKey: process.env.FIREBASE_apiKey,
  authDomain: process.env.FIREBASE_authDomain,
  projectId: process.env.FIREBASE_projectId,
  storageBucket: process.env.FIREBASE_storageBucket,
  messagingSenderId: process.env.FIREBASE_messagingSenderId,
  appId: process.env.FIREBASE_appId,
  measurementId: process.env.FIREBASE_measurementId,
};

export const DiscordAuthConfig = {
  authorizationURL: process.env.OAUTH_DISCORD_URL || '',
  clientID: process.env.OAUTH_DISCORD_CLIENT_ID || '',
  clientSecret: process.env.OAUTH_DISCORD_CLIENT_SECRET || '',
  redirectUrl: process.env.OAUTH_DISCORD_REDIRECT_URI || '',
  scopes: (process.env.OAUTH_DISCORD_SCOPE || '').split(','),
};
