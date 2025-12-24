import type { User } from '@alias/shared';

export const getCallbackHtml = (user: User) => `
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
