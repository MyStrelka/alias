export type RootStoreActions = {
  loginWithProvider: (provider: AuthProvider) => void;
  logout: () => void;
  setNetworkState: (networkState: RootStore['networkState']) => void;
  setPlayerName: (playerName: string) => void;
};

export type RootStore = {
  deviceId: string;
  networkState: 'idle' | 'connecting' | 'connected';
  actions: RootStoreActions;
  user: User;
};

export type AuthProvider = 'google' | 'discord' | 'anonim';

export interface User {
  id: string | null;
  name: string | '';
  playerName: string | '';
  email: string | '';
  providerId: AuthProvider;
  avatar?: string;
  token?: string;
  refreshToken?: string;
}
