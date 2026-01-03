import toast from 'react-hot-toast';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  GameState,
  GameStateActions,
  GameStatePlayer,
  GameStateRound,
  Player,
  Settings,
} from '@seaborn/shared/alias';

import { generateWords } from '../../services/game';
import { socketService } from '../../services/socketService';
import { useRootStore } from '../rootStore';

interface TeamTheme {
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

const initialRound: GameStateRound = {
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
};

const initialState: GameState & GameStatePlayer = {
  stage: 'login',
  settings: initialSettings,
  players: [],
  teams: [],
  round: initialRound,
  roomId: null,
  isHost: false,
  isMuted: false,
  hostId: null,
  customTopic: null,
  customWords: null,
  wordLog: [],
};

const deviceId = useRootStore.getState().deviceId;

export const useGameStore = create<
  GameState & GameStatePlayer & GameStateActions
>()(
  persist(
    (set, get) => {
      const roomUpdatedHandler = (gameState: GameState) => {
        const { deviceId, actions: rootActions } = useRootStore.getState();

        const me = gameState.players?.find(
          (p: Player) => p.deviceId === deviceId,
        );
        // Если нас удалили из списка игроков (кикнули)
        if (gameState.players && !me && get().stage !== 'login') {
          toast.error('Вы были исключены из игры');
          get().actions.leaveGame();
          return;
        }

        const amIHost = me ? !!me.isHost : get().isHost || false;

        set((state) => ({
          ...state,
          ...gameState,
          actions: state.actions,
          isMuted: state.isMuted,

          isHost: amIHost,
        }));

        set(gameState);
        rootActions.setNetworkState('connected');
      };

      return {
        ...initialState,

        actions: {
          createRoom: () => {
            const { actions: rootActions, user } = useRootStore.getState();
            console.log('[createRoom]');
            rootActions.setNetworkState('connecting');
            socketService.connect(deviceId, user, null, roomUpdatedHandler);
          },

          joinRoom: (roomId) => {
            const { actions: rootActions, user } = useRootStore.getState();
            console.log('[joinRoom] roomId', roomId);
            rootActions.setNetworkState('connecting');
            socketService.connect(deviceId, user, roomId, roomUpdatedHandler);
          },

          leaveRoom: () => {
            socketService.disconnect();
            set({
              ...initialState,
              roomId: null,
              isHost: false,
              actions: get().actions,
            });
          },
          updateSettings: (part) =>
            socketService.socket?.emit('update_settings', part),
          toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
          leaveGame: () => {
            socketService.disconnect();
            set({
              ...initialState,
              roomId: null,
              isHost: false,
              actions: get().actions,
            });
          },
          shuffleTeams: () => socketService.socket?.emit('shuffle_teams'),
          markRoundReady: (deviceId, status) =>
            socketService.socket?.emit('round_ready', { deviceId, status }),
          startGameRound: () => socketService.socket?.emit('start_round'),
          joinTeam: (deviceId: string, teamId: string) => {
            socketService.socket?.emit('join_team', { deviceId, teamId });
          },
          createTeam: () => socketService.socket?.emit('create_team'),
          kickPlayer: (targetId: string) =>
            socketService.socket?.emit('kick_player', { targetId }),
          toggleReady: () => socketService.socket?.emit('toggle_ready'),
          startGame: () => socketService.socket?.emit('start_game'),
          deleteTeam: (teamId: string) =>
            socketService.socket?.emit('delete_team', { teamId }),
          togglePause: () => socketService.socket?.emit('toggle_pause'),
          handleCorrect: () =>
            socketService.socket?.emit('game_action', 'correct'),
          handleSkip: () => socketService.socket?.emit('game_action', 'skip'),
          finishRound: () => socketService.socket?.emit('finish_round'),
          wordAdjustment: (wordLogIndex, score) =>
            socketService.socket?.emit('word_adjustment', {
              wordLogIndex,
              score,
            }),
          generateWordsAI: async (roomId: string, topic: string) => {
            await generateWords(roomId, topic);
          },
          clearCustomWords: () =>
            socketService.socket?.emit('custom_words_clear'),
        },
      };
    },
    {
      name: 'aliasStore',
      partialize: (state) => ({
        roomId: state.roomId,
        isHost: state.isHost,
      }),
    },
  ),
);
