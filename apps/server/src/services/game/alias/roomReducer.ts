import { SETTINGS } from '@seaborn/shared/alias';
import type { GameState, Settings, WordLog } from '@seaborn/shared/alias';
import type { User } from '@seaborn/shared/root';

import {
  getNewPlayer,
  getNewTeamId,
  nextTeamTurn,
  pickWord,
  selectChallenge,
} from './utils';

export type GameAction =
  | {
      type: 'PLAYER_JOIN_ROOM';
      payload: {
        socketId: string;
        roomId: string;
        user: User;
        hostId?: string;
      };
    }
  | {
      type: 'SET_PLAYER_OFFLINE';
    }
  | { type: 'UPDATE_SETTINGS'; payload: { settings: Settings } }
  | { type: 'SHUFFLE_TEAMS' }
  | { type: 'LEAVE_TEAM' }
  | {
      type: 'MARK_ROUND_READY';
      payload: { deviceId: string; status: boolean };
    }
  | {
      type: 'JOIN_TEAM';
      payload: { deviceId: string; teamId: string };
    }
  | { type: 'KICK_PLAYER'; payload: { targetId: string } }
  | { type: 'CREATE_TEAM' }
  | { type: 'DELETE_TEAM'; payload: { teamId: string } }
  | { type: 'TOGGLE_READY' }
  | { type: 'START_GAME' }
  | { type: 'START_ROUND' }
  | { type: 'ROUND_TIMER' }
  | { type: 'ROUND_OVER' }
  | { type: 'TOGGLE_PAUSE' }
  | {
      type: 'GAME_ACTION';
      payload: { action: 'correct' | 'skip' };
    }
  | {
      type: 'FINISH_ROUND';
    }
  | {
      type: 'VICTORY';
      payload: { winnerId: string };
    }
  | { type: 'NEXT_ROUND' }
  | {
      type: 'CUSTOM_WORDS_MODIFY';
      payload: { topic: string; words: string[] };
    }
  | { type: 'CUSTOM_WORDS_CLEAR' }
  | {
      type: 'WORD_ADJUSTMENT';
      payload: {
        wordLogIndex: number;
        score: WordLog['score'];
      };
    };

export const initialState: GameState = {
  stage: 'lobby',
  settings: {
    difficulty: 'medium',
    roundTime: 60,
    winScore: 30,
    mode: 'team',
    enableChallenges: false,
  },
  players: [],
  teams: [
    { id: 'team-1', name: 'Команда 1', playerIds: [], score: 0, themeIndex: 0 },
    { id: 'team-2', name: 'Команда 2', playerIds: [], score: 0, themeIndex: 1 },
  ],
  round: {
    roundNumber: 0,
    timeLeft: 60,
    timerActive: false,
    currentWord: '...',
    activeChallenge: null,
    readyMap: {},
    teamSpeakerIndex: {},
    currentTeamId: null,
    speakerId: null,
    listenerId: null,
    wordLog: [],
  },
  roomId: null,
  hostId: null,
  customTopic: null,
  customWords: null,
  wordLog: [],
};

export const roomReducer = (
  state: GameState,
  action: GameAction,
  deviceId: string,
): GameState => {
  switch (action.type) {
    case 'PLAYER_JOIN_ROOM': {
      const { payload } = action;
      const { socketId, user, hostId } = payload;

      const playerExists = state.players.some((p) => p.deviceId === deviceId);

      return {
        ...state,
        players: playerExists
          ? state.players.map((p) =>
              p.deviceId === deviceId ? { ...p, socketId, online: true } : p,
            )
          : [...state.players, getNewPlayer(socketId, deviceId, user, hostId)],
      };
    }
    case 'SET_PLAYER_OFFLINE': {
      return {
        ...state,
        players: state.players.map((p) =>
          p.deviceId === deviceId ? { ...p, online: false, ready: false } : p,
        ),
      };
    }
    case 'UPDATE_SETTINGS': {
      const { payload } = action;
      const { settings } = payload;
      return {
        ...state,
        settings: {
          ...state.settings,
          ...settings,
        },
      };
    }
    case 'SHUFFLE_TEAMS': {
      if (state.hostId !== deviceId) return state;

      const teams = [...state.teams];
      const players = [...state.players].sort(() => Math.random() - 0.5);
      teams.forEach((t) => (t.playerIds = []));
      players.forEach((p, i) => {
        const targetTeam = teams[i % teams.length];
        p.teamId = targetTeam?.id;
        targetTeam?.playerIds.push(p.deviceId);
      });

      return {
        ...state,
        players,
        teams,
      };
    }
    case 'LEAVE_TEAM': {
      return {
        ...state,
        teams: state.teams.map((team) => ({
          ...team,
          playerIds: team.playerIds.filter((ids) => ids !== deviceId),
        })),
        players: state.players.map((p) =>
          p.deviceId === deviceId ? { ...p, teamId: undefined } : p,
        ),
      };
    }
    case 'JOIN_TEAM': {
      const { payload } = action;
      const { deviceId, teamId } = payload;
      return {
        ...state,
        teams: state.teams.map((team) =>
          team.id === teamId
            ? { ...team, playerIds: [...team.playerIds, deviceId] }
            : team,
        ),
        players: state.players.map((player) =>
          player.deviceId === deviceId ? { ...player, teamId } : player,
        ),
      };
    }
    case 'MARK_ROUND_READY': {
      const { payload } = action;
      const { deviceId, status } = payload;
      return {
        ...state,
        round: {
          ...state.round,
          readyMap: { ...state.round.readyMap, [deviceId]: status },
        },
      };
    }
    case 'KICK_PLAYER': {
      if (state.hostId !== deviceId) return state;

      const { payload } = action;
      const { targetId } = payload;
      return {
        ...state,
        players: state.players.filter((player) => player.deviceId !== targetId),
        teams: state.teams.map((team) => ({
          ...team,
          playerIds: team.playerIds.filter((id) => id !== targetId),
        })),
      };
    }
    case 'CREATE_TEAM': {
      if (state.hostId !== deviceId) return state;
      if (state.teams.length >= SETTINGS.MAX_TEAM_COUNT) return state;

      const newTeamId = getNewTeamId(state.teams);
      if (!newTeamId) return state;

      return {
        ...state,
        teams: [
          ...state.teams,
          {
            id: `team-${newTeamId}`,
            name: `Команда ${newTeamId}`,
            playerIds: [],
            score: 0,
            themeIndex: newTeamId,
          },
        ],
      };
    }
    case 'DELETE_TEAM': {
      if (state.hostId !== deviceId) return state;

      const { payload } = action;
      const { teamId } = payload;

      return {
        ...state,
        teams: state.teams.filter((team) => team.id !== teamId),
        players: state.players.map((player) => {
          if (player.teamId === teamId) return { ...player, teamId: undefined };
          else return player;
        }),
      };
    }
    case 'TOGGLE_READY': {
      return {
        ...state,
        players: state.players.map((player) =>
          player.deviceId === deviceId
            ? { ...player, ready: !player.ready }
            : player,
        ),
      };
    }
    case 'START_GAME': {
      if (state.hostId !== deviceId) return state;

      const nextTurn = nextTeamTurn(
        state.teams,
        state.players,
        state.round.currentTeamId,
        state.round.teamSpeakerIndex,
        state.settings.mode,
        true,
      );

      const currentWord = pickWord(
        state.settings.difficulty,
        state.wordLog,
        state.customWords,
      );

      const challenge = selectChallenge(1, state.settings.enableChallenges);

      return {
        ...state,
        stage: 'preround',
        round: {
          ...state.round,
          ...nextTurn,
          roundNumber: 1,
          timeLeft: state.settings.roundTime,
          timerActive: false,
          readyMap: {},
          currentWord,
          activeChallenge: challenge,
        },
        wordLog: [],
      };
    }
    case 'START_ROUND': {
      const { round } = state;
      if (!round.speakerId || !round.listenerId) return state;
      if (!round.readyMap[round.speakerId] || !round.readyMap[round.listenerId])
        return state;

      return {
        ...state,
        stage: 'play',
        round: {
          ...state.round,
          timerActive: true,
          timeLeft: state.settings.roundTime,
        },
      };
    }
    case 'ROUND_TIMER': {
      return {
        ...state,
        round: { ...state.round, timeLeft: state.round.timeLeft - 1 },
      };
    }
    case 'ROUND_OVER': {
      return {
        ...state,
        stage: 'play-adjustment',
      };
    }
    case 'TOGGLE_PAUSE': {
      return {
        ...state,
        round: { ...state.round, timerActive: !state.round.timerActive },
      };
    }
    case 'GAME_ACTION': {
      const { payload } = action;

      const nextWordLog: WordLog = {
        word: `${state.round.currentWord}`,
        score: payload.action === 'correct' ? 1 : -1,
      };
      return {
        ...state,
        round: {
          ...state.round,
          wordLog: [...state.round.wordLog, nextWordLog],
          currentWord: pickWord(
            state.settings.difficulty,
            state.wordLog,
            state.customWords,
          ),
        },
        wordLog: [...state.wordLog, nextWordLog.word],
      };
    }
    case 'FINISH_ROUND': {
      const sp = state.players.find(
        (p) => p.deviceId === state.round.speakerId,
      );

      const ls = state.players.find(
        (p) => p.deviceId === state.round.listenerId,
      );

      const correctCount = state.round.wordLog.filter(
        (word) => word.score === 1,
      ).length;
      const skipCount = state.round.wordLog.filter(
        (word) => word.score === -1,
      ).length;

      return {
        ...state,
        players: state.players.map((player) => {
          if (player.deviceId === state.round.speakerId) {
            return {
              ...player,
              score: correctCount - skipCount,
              explained: correctCount,
            };
          } else if (player.deviceId === state.round.listenerId) {
            return { ...player, score: correctCount, guessed: correctCount };
          } else return player;
        }),
        teams: state.teams.map((team) => {
          if (team.id === sp?.teamId) {
            return { ...team, score: correctCount + skipCount };
          } else return team;
        }),
      };
    }
    case 'VICTORY': {
      const { payload } = action;
      const { winnerId } = payload;
      return {
        ...state,
        stage: 'victory',
        victory: {
          ...state.victory,
          winnerId,
        },
      };
    }
    case 'NEXT_ROUND': {
      const nextTurn = nextTeamTurn(
        state.teams,
        state.players,
        state.round.currentTeamId,
        state.round.teamSpeakerIndex,
        state.settings.mode,
        false,
      );

      const currentWord = pickWord(
        state.settings.difficulty,
        state.wordLog,
        state.customWords,
      );

      const challenge = selectChallenge(1, state.settings.enableChallenges);

      return {
        ...state,
        stage: 'preround',
        round: {
          ...state.round,
          ...nextTurn,
          roundNumber: state.round.roundNumber + 1,
          timeLeft: state.settings.roundTime,
          timerActive: false,
          readyMap: {},
          currentWord,
          activeChallenge: challenge,
          wordLog: [],
        },
      };
    }
    case 'WORD_ADJUSTMENT': {
      const { payload } = action;
      const { wordLogIndex, score } = payload;
      return {
        ...state,
        round: {
          ...state.round,
          wordLog: state.round.wordLog.map((word, index) => {
            if (index === wordLogIndex && [-1, 0, 1].indexOf(score) > -1) {
              return { ...word, score };
            } else return word;
          }),
        },
      };
    }
    case 'CUSTOM_WORDS_MODIFY': {
      const { payload } = action;
      const { topic, words } = payload;
      if (words.length === 0) return state;

      return {
        ...state,
        customTopic: topic,
        customWords: words,
      };
    }
    case 'CUSTOM_WORDS_CLEAR': {
      return {
        ...state,
        customTopic: null,
        customWords: null,
      };
    }

    default:
      return state;
  }
};
