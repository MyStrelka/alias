export type Mode = 'team' | 'solo_standard' | 'solo_all_vs_all';
export type GameStage = 'login' | 'lobby' | 'preround' | 'play' | 'victory';
export type Difficulty = 'easy' | 'medium' | 'hard';
// export interface Settings {
//   difficulty: 'easy' | 'medium' | 'hard';
//   roundTime: number;
//   winScore: number;
//   mode: Mode;
//   enableChallenges: boolean;
// }

export interface Settings {
  difficulty: Difficulty;
  roundTime: number;
  winScore: number;
  mode: Mode;
  enableChallenges: boolean;
}

export interface Player {
  id: string;
  userId: string;
  name: string;
  score: number;
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
  };
  victory?: { winnerId: string };
};
