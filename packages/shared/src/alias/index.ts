import type { User } from '../root';

export const SETTINGS = {
  MAX_TEAM_COUNT: 5,
};

export type Mode = 'team' | 'solo_standard' | 'solo_all_vs_all';
export type GameStage =
  | 'login'
  | 'lobby'
  | 'preround'
  | 'play'
  | 'play-adjustment'
  | 'victory';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Settings {
  difficulty: Difficulty;
  roundTime: number;
  winScore: number;
  mode: Mode;
  enableChallenges: boolean;
}

export type PlayerRole = 'listener' | 'speaker' | 'spectator';

export interface Player {
  socketId: string;
  deviceId: string;
  dbId: string | null;
  name: string;
  score: number;
  role: PlayerRole;
  isHost: boolean;
  ready: boolean;
  avatar: string | null;
  explained: number;
  guessed: number;
  online: boolean;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  playerIds: string[];
  score: number;
  themeIndex: number;
}

// export interface Room {
//   hostId: string;
//   gameState: GameState;
//   timerInterval?: ReturnType<typeof setInterval>;
// }

export type WordLog = {
  word: string;
  score: -1 | 0 | 1;
};

export type GameStateRound = {
  roundNumber: number;
  timeLeft: number;
  running: boolean;
  currentWord: string;
  activeChallenge: string | null;
  readyMap: Record<string, boolean>;
  teamSpeakerIndex: Record<string, number>;
  currentTeamId: string | null;
  speakerId: string | null;
  listenerId: string | null;
  wordLog: WordLog[];
};

export type GameStatePlayer = {
  isHost: boolean;
  isMuted: boolean;
};

export type GameState = {
  stage: GameStage;
  settings: Settings;
  players: Player[];
  teams: Team[];
  round: GameStateRound;
  roomId: string | null;
  hostId: string | null;
  victory?: { winnerId: string };
  customWords: string[] | null;
  customTopic: string | null;
  wordLog: string[];
};

export type GameStateActions = {
  actions: {
    createRoom: () => void;
    joinRoom: (roomId: string) => void;
    leaveRoom: () => void;
    updateSettings: (s: Partial<Settings>) => void;
    toggleMute: () => void;
    leaveGame: () => void;
    shuffleTeams: () => void;
    markRoundReady: (deviceId: string, status: boolean) => void;
    startGameRound: () => void;
    joinTeam: (deviceId: string, teamId: string) => void;
    createTeam: () => void;
    deleteTeam: (teamId: string) => void;
    kickPlayer: (targetId: string) => void;
    toggleReady: () => void;
    startGame: () => void;
    togglePause: () => void;
    handleCorrect: () => void;
    handleSkip: () => void;
    finishRound: () => void;
    wordAdjustment: (wordLlogIndex: number, score: WordLog['score']) => void;
    generateWordsAI: (roomId: string, topic: string) => Promise<void>;
    clearCustomWords: () => void;

    // TODO:
    // tick: () => void;
    // restart: () => void;
    // backToLobby: () => void;
    //
  };
};

interface CreateRoomPayload {
  deviceId: string;
  user: User;
}

interface RoundReadyPayload {
  deviceId: string;
  status: boolean;
}

export interface ClientToServerEvents {
  create_room: (data: CreateRoomPayload) => void;
  join_room: (data: CreateRoomPayload & { roomId: string }) => void;
  update_settings: (part: Partial<Settings>) => void;
  shuffle_teams: () => void;
  round_ready: ({ deviceId, status }: RoundReadyPayload) => void;
  start_round: () => void;
  join_team: ({
    deviceId,
    teamId,
  }: {
    deviceId: string;
    teamId: string;
  }) => void;
  create_team: () => void;
  delete_team: (data: { teamId: string }) => void;
  kick_player: (data: { targetId: string }) => void;
  toggle_ready: () => void;
  start_game: () => void;
  toggle_pause: () => void;
  game_action: (action: 'correct' | 'skip') => void;
  finish_round: () => void;
  word_adjustment: (data: {
    wordLogIndex: number;
    score: WordLog['score'];
  }) => void;
  custom_words_clear: () => void;
}

export interface ServerToClientEvents {
  room_updated: (gameState: GameState) => void;
}
