import toast from 'react-hot-toast';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  GameState,
  GameStateActions,
  GameStateClient,
  Player,
  Settings,
} from '@alias/shared';

import authService from '../services/auth';
import gameService from '../services/game';
import { socketService } from '../services/socketService';

export interface TeamTheme {
  border: string;
  bg: string;
  text: string;
  name: string;
}
export const TEAM_THEMES: TeamTheme[] = [
  {
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/5',
    text: 'text-rose-200',
    name: 'Rose',
  },
  {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    text: 'text-blue-200',
    name: 'Blue',
  },
  {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-200',
    name: 'Emerald',
  },
  {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    text: 'text-amber-200',
    name: 'Amber',
  },
  {
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/5',
    text: 'text-violet-200',
    name: 'Violet',
  },
];

const initialSettings: Settings = {
  difficulty: 'medium',
  roundTime: 60,
  winScore: 30,
  mode: 'team',
  enableChallenges: true,
};

const initialState: GameState & GameStateClient = {
  stage: 'login',
  isHost: false,
  players: [],
  teams: [],
  settings: initialSettings,
  customWords: null,
  customTopic: null,
  round: {
    roundNumber: 0,
    timeLeft: 60,
    running: false,
    currentWord: '...',
    readyMap: {},
    teamSpeakerIndex: {},
    activeChallenge: null,

    currentTeamId: null,
    speakerId: null,
    listenerId: null,
    wordLog: [],
  },
  // victory: null,
  isMuted: false,
  networkReady: false,
  user: null,
  roomId: null,
  selfId: null,
};

const getDeviceId = () => {
  let id = localStorage.getItem('alias_device_id');
  if (!id) {
    id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('alias_device_id', id);
  }
  return id;
};

export const useGameStore = create<
  GameState & GameStateClient & GameStateActions
>()(
  persist(
    (set, get) => {
      socketService.setHandler((type, payload) => {
        if (type === 'state') {
          const currentSocketId = socketService.socket?.id;
          const me = payload.players?.find(
            (p: Player) => p.id === currentSocketId,
          );
          // Если нас удалили из списка игроков (кикнули)
          if (payload.players && !me && get().stage !== 'login') {
            toast.error('Вы были исключены из игры');
            get().actions.leaveGame();
            return;
          }

          const amIHost = me ? !!me.isHost : get().isHost || false;

          set((state) => ({
            ...state,
            ...payload,
            actions: state.actions,
            user: state.user,
            isMuted: state.isMuted,
            selfId: currentSocketId || state.selfId,
            isHost: amIHost,
          }));
        }
      });

      return {
        ...initialState,
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
            set({ user: null });
            toast.success('Вышли');
          },
          createRoom: async () => {
            try {
              const { user } = get();
              const deviceId = getDeviceId();
              if (!user?.name) return;
              if (user?.providerId === 'anonim') {
                await gameService.createIncognitoUser(
                  deviceId,
                  user.playerName,
                );
              }

              const roomId = await socketService.createRoom({
                playerName: user.playerName,
                dbId: user?.id || null,
                avatar: user?.avatar || null,
                deviceId,
                userProviderId: user.providerId,
              });
              set({
                stage: 'lobby',
                selfId: socketService.socket?.id,
                roomId,
                isHost: true,
              });
            } catch (e) {
              console.error(e);
            }
          },
          joinRoom: async (roomId) => {
            try {
              const { user } = get();
              const deviceId = getDeviceId();
              if (!user?.name) return;
              if (user?.providerId === 'anonim') {
                await gameService.createIncognitoUser(
                  deviceId,
                  user.playerName,
                );
              }
              await socketService.joinRoom({
                roomId,
                playerName: user.playerName,
                dbId: user.id || null,
                avatar: user.avatar || null,
                deviceId,
                userProviderId: user.providerId,
              });
              set({
                stage: 'lobby',
                selfId: socketService.socket?.id,
                roomId,
              });
            } catch (error) {
              toast.error(`${error}`);
              console.error(error);
            }
          },
          backToLobby: () => {
            const { isHost } = get();
            if (isHost) {
              get().actions.restart();
            } else {
              set({ stage: 'lobby' });
            }
          },
          leaveGame: () => {
            socketService.close();
            const { isMuted, user } = get();
            set({
              ...initialState,
              roomId: null,
              isHost: false,
              isMuted,
              user,
              actions: get().actions,
            });
          },

          // 🔥 Kick
          kickPlayer: (playerId) =>
            socketService.reliableEmit('kick_player', playerId),

          createTeam: () => socketService.createTeam(),
          joinTeam: (teamId) => socketService.joinTeam(teamId),
          toggleReady: () => socketService.reliableEmit('toggle_ready'),
          updateSettings: (part) =>
            socketService.reliableEmit('update_settings', part),
          shuffleTeams: () => socketService.reliableEmit('shuffle_teams'),
          startGame: () => socketService.reliableEmit('start_game'),
          markRoundReady: (playerId, status) =>
            socketService.reliableEmit('round_ready', { playerId, status }),
          startRound: () => socketService.reliableEmit('start_round'),
          startGameRound: () => socketService.reliableEmit('start_round'),
          togglePause: () => socketService.reliableEmit('toggle_pause'),
          handleCorrect: () =>
            socketService.reliableEmit('game_action', 'correct'),
          handleSkip: () => socketService.reliableEmit('game_action', 'skip'),
          restart: () => socketService.reliableEmit('restart'),

          tick: () => {},
          broadcastState: () => {},
          injectState: () => {},
          toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
          generateWordsAI: async () => {},
          clearCustomWords: () => {},
          wordAdjustment: (wordLogIndex, score) =>
            socketService.reliableEmit('word_adjustment', {
              wordLogIndex,
              score,
            }),
          finishRound: () => socketService.reliableEmit('finish_round'),
          setPlayerName: (playerName: string) => {
            const { user } = get();
            set({
              user: user
                ? { ...user, playerName }
                : {
                    id: getDeviceId(),
                    name: playerName,
                    playerName,
                    email: '',
                    providerId: 'anonim',
                  },
            });
          },
        },
      };
    },
    {
      name: 'gameStore',
      partialize: (state) => ({
        roomId: state.roomId,
        isHost: state.isHost,
        user: state.user,
      }),
    },
  ),
);
