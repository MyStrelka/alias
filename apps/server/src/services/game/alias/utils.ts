import type {
  Difficulty,
  GameState,
  Mode,
  Player,
  Team,
} from '@seaborn/shared/alias';
import type { User } from '@seaborn/shared/root';

import { CHALLENGES } from '../../../data/challenges';
import { words } from '../../../data/words';

export const getNewPlayer = (
  socketId: string,
  deviceId: string,
  user: User,
  hostId?: string,
) =>
  ({
    deviceId,
    name: user.playerName,
    isHost: hostId && hostId === deviceId,
    socketId,
    online: true,
    dbId: user.id || null,
    score: 0,
    role: 'spectator',
    ready: false,
    avatar: user.avatar || null,
    explained: 0,
    guessed: 0,
  }) as Player;

export const getNewTeamId = (teams: GameState['teams']): number | null => {
  if (teams.length === 0) return 1;

  const lastTeam = teams.sort((a, b) => `${b.id}`.localeCompare(`${a.id}`))[0]
    ?.id;
  if (!lastTeam) return null;

  const match = lastTeam.match(/\d+/);
  const index = match ? parseInt(match[0], 10) + 1 : null;

  return index;
};

export const nextTeamTurn = (
  teams: Team[],
  players: Player[],
  currentTeamId: string | null,
  teamSpeakerIndex: Record<string, number>,
  mode: Mode,
  isNewGame = false,
) => {
  const count = players.length;
  if (count < 2 && mode !== 'team') return {};

  if (mode === 'team') {
    const validTeams = teams.filter((t) => t.playerIds.length >= 2);
    if (validTeams.length === 0) return {};

    let currentTeamIdx = -1;
    if (currentTeamId)
      currentTeamIdx = validTeams.findIndex((t) => t.id === currentTeamId);

    let nextTeamIdx;
    if (isNewGame || currentTeamIdx === -1) {
      nextTeamIdx = 0;
    } else {
      nextTeamIdx = (currentTeamIdx + 1) % validTeams.length;
    }

    const nextTeam = validTeams[nextTeamIdx];
    // TODO: possibly false
    if (!nextTeam) return {};

    const teamPlayers = players
      .filter((p) => p.teamId === nextTeam.id)
      .sort((a, b) => a.name.localeCompare(b.name));

    if (teamPlayers.length < 2) return {};

    const speakerIdx = teamSpeakerIndex[nextTeam!.id] || 0;
    const nextSpeakerIdx = (speakerIdx + 1) % teamPlayers.length;
    const listenerIdx = (nextSpeakerIdx + 1) % teamPlayers.length;

    const updatedIndex = { ...teamSpeakerIndex, [nextTeam.id]: nextSpeakerIdx };

    return {
      speakerId: teamPlayers[nextSpeakerIdx]!.deviceId,
      listenerId: teamPlayers[listenerIdx]!.deviceId,
      currentTeamId: nextTeam.id,
      teamSpeakerIndex: updatedIndex,
    };
  }

  if (mode === 'solo_standard') {
    let currentSpeakerIndex = -1;
    if (currentTeamId)
      currentSpeakerIndex = players.findIndex(
        (p) => p.deviceId === currentTeamId,
      );
    let nextSpeakerIndex: number;
    if (isNewGame || currentSpeakerIndex === -1) {
      nextSpeakerIndex = 0;
    } else {
      nextSpeakerIndex = (currentSpeakerIndex + 1) % count;
    }
    const speakerId = players[nextSpeakerIndex]!.deviceId;
    const listenerIndex = (nextSpeakerIndex + 1) % count;
    return {
      speakerId,
      listenerId: players[listenerIndex]!.deviceId,
      currentTeamId: speakerId,
      teamSpeakerIndex,
    };
  }

  if (mode === 'solo_all_vs_all') {
    let currentListenerId = currentTeamId;
    let speakerId = currentTeamId;
    let listenerId;

    if (isNewGame) {
      speakerId = players[0]!.deviceId;
      listenerId = players[1]!.deviceId;
    } else {
      const currentListenerIndex = players.findIndex(
        (p) => p.deviceId === currentListenerId,
      );
      const nextListenerIndex = (currentListenerIndex + 1) % count;
      listenerId = players[nextListenerIndex]!.deviceId;

      if (speakerId === listenerId) {
        const currentSpeakerIndex = players.findIndex(
          (p) => p.deviceId === speakerId,
        );
        const nextSpeakerIndex = (currentSpeakerIndex + 1) % count;
        speakerId = players[nextSpeakerIndex]!.deviceId;
        const newListenerIndex = (nextSpeakerIndex + 1) % count;
        listenerId = players[newListenerIndex]!.deviceId;
      }
    }
    return {
      speakerId,
      listenerId,
      currentTeamId: speakerId,
      teamSpeakerIndex,
    };
  }
  return {};
};

export const selectChallenge = (
  roundNumber: number,
  challengesEnabled: boolean,
): string | null => {
  if (!challengesEnabled) return null;
  if (roundNumber === 0 || roundNumber % 3 !== 0) return null;
  return CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)] || null;
};

export const pickWord = (
  difficulty: Difficulty,
  wordLog: string[],
  customWords: string[] | null,
): string => {
  const pool =
    customWords || words[difficulty] || words['medium'] || words['easy'];
  if (!pool || pool.length === 0) return 'Слова не загружены';
  const word = pool[Math.floor(Math.random() * pool.length)]!;
  if (wordLog.includes(word)) {
    if (wordLog.length >= pool.length) {
      return 'Слова закончились :(';
    }

    return pickWord(difficulty, wordLog, customWords);
  }
  return word;
};
