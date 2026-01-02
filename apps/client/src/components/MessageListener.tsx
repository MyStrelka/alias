import { useEffect } from 'react';

import type { User } from '@seaborn/shared/root';

import { useRootStore } from '../store/rootStore';

export default function AuthCallbackMessageListener() {
  const parentOrigin = import.meta.env.VITE_SERVER_URL || 'localhost:3000';

  function onRecievedMessage(event: MessageEvent<{ user: User }>) {
    if (event.origin !== parentOrigin) {
      return;
    }

    const { user } = event.data;

    useRootStore.setState({ user });
  }

  useEffect(function () {
    window.addEventListener('message', onRecievedMessage);

    return function () {
      window.removeEventListener('message', onRecievedMessage);
    };
  });
  return null;
}
