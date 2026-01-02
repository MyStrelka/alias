import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import type { RootStore, User } from '@seaborn/shared/root';

import authService from '../services/auth';

const defaultUser: User = {
  id: null,
  name: '',
  playerName: '',
  email: '',
  providerId: 'anonim',
};

export const useRootStore = create<RootStore>()(
  devtools(
    persist(
      (set, get) => ({
        deviceId: uuidv4(),
        networkState: 'idle',
        user: defaultUser,
        actions: {
          loginWithProvider: async (provider) => {
            try {
              await authService.providerAuth(provider);
            } catch (e) {
              console.error(e);
              toast.error('Ошибка входа');
            }
          },
          logout: async () => {
            set({ user: defaultUser });
            toast.success('Вышли');
          },
          setNetworkState(networkState) {
            set({ networkState });
          },
          setPlayerName: (playerName: string) => {
            const { user, deviceId } = get();
            const nextUser: User =
              user !== null
                ? { ...user, playerName }
                : {
                    ...get().user,
                    id: deviceId,
                    name: playerName,
                    playerName,
                  };

            set({ user: nextUser });
          },
        },
      }),
      {
        name: 'rootStore',
        partialize: (state) => ({
          deviceId: state.deviceId,
          networkState: state.networkState,
          user: state.user,
        }),
      },
    ),
  ),
);
