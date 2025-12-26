export type Mode = 'team' | 'solo_standard' | 'solo_all_vs_all';
export type GameStage =
  | 'login'
  | 'lobby'
  | 'preround'
  | 'play'
  | 'play-adjustment'
  | 'victory';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AuthProvider = 'google' | 'discord';

export interface User {
  id: string;
  name: string;
  email: string;
  providerId: string;
  avatar?: string;
  token?: string;
  refreshToken?: string;
  loginCount?: number;
}

export interface Settings {
  difficulty: Difficulty;
  roundTime: number;
  winScore: number;
  mode: Mode;
  enableChallenges: boolean;
}

export type PlayerRole = 'listener' | 'speaker' | 'spectator';

export interface Player {
  id: string;
  deviceId: string;
  name: string;
  score: number;
  role: PlayerRole;
  isHost: boolean;
  ready: boolean;
  dbId: string | null;
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

export interface Room {
  hostId: string;
  gameState: GameState;
  players: Player[];
  timerInterval?: ReturnType<typeof setInterval>;
}

export type WordLog = {
  word: string;
  score: -1 | 0 | 1;
};

export type GameState = {
  stage: GameStage;
  settings: Settings;
  players: Player[];
  teams: Team[];
  round: {
    roundNumber: number;
    timeLeft: number;
    running: boolean;
    currentWord: string;
    activeChallenge: string | null;
    readyMap: Record<string, boolean>;
    teamSpeakerIndex: Record<string, number>; // TODO: ???
    currentTeamId: string | null;
    speakerId: string | null;
    listenerId: string | null;
    wordLog: WordLog[];
  };
  victory?: { winnerId: string };
};

export type GameStateClient = {
  selfId?: string;
  selfName?: string;
  roomId?: string;
  isHost: boolean;
  customWords: string[] | null;
  customTopic: string | null;
  isMuted: boolean;
  networkReady: boolean;
  user: User | null;
};

export type GameStateActions = {
  actions: {
    loginWithProvider: (provider: AuthProvider) => Promise<void>;
    logout: () => void;
    createRoom: (name: string) => Promise<void>;
    joinRoom: (name: string, roomId: string) => Promise<void>;
    toggleReady: () => void;
    updateSettings: (s: Partial<Settings>) => void;
    shuffleTeams: () => void;
    createTeam: () => void;
    joinTeam: (teamId: string) => void;
    startGame: () => void;
    markRoundReady: (playerId: string, status: boolean) => void;
    startRound: () => void;
    togglePause: () => void;
    handleCorrect: () => void;
    handleSkip: () => void;
    tick: () => void;
    restart: () => void;
    toggleMute: () => void;
    backToLobby: () => void;
    leaveGame: () => void;
    kickPlayer: (playerId: string) => void;
    generateWordsAI: (topic: string) => Promise<void>;
    clearCustomWords: () => void;
    broadcastState: () => void;
    injectState: (incoming: Partial<GameState>) => void;
    startGameRound: () => void;
    saveSession: () => void;
    restoreSession: () => { roomId: string; selfName: string } | null;
    wordAdjustment: (
      wordLlogIndex: number,
      score: Pick<WordLog, 'score'>,
    ) => void;
    finishRound: () => void;
  };
};
