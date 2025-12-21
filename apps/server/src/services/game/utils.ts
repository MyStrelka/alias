import type { Difficulty, Mode, Player, Room, Team } from '@alias/shared';

import { CHALLENGES } from '../../data/challenges';
import { words } from '../../data/words';

export const generateRoomId = () =>
  Math.floor(1000 + Math.random() * 9000).toString();

export const pickWord = (difficulty: Difficulty): string => {
  const pool = words[difficulty] || words['medium'] || words['easy'];
  if (!pool || pool.length === 0) return 'Слова не загружены';
  return pool[Math.floor(Math.random() * pool.length)]!;
};

export const selectChallenge = (
  roundNumber: number,
  challengesEnabled: boolean,
): string | null => {
  if (!challengesEnabled) return null;
  if (roundNumber === 0 || roundNumber % 3 !== 0) return null;
  return CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)] || null;
};

export const findRoom = (rooms: Map<string, Room>, socketId: string) => {
  for (const [roomId, room] of rooms) {
    if (room.players.some((p) => p.id === socketId) || room.hostId === socketId)
      return { roomId, room };
  }
  return null;
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
      speakerId: teamPlayers[nextSpeakerIdx]!.id,
      listenerId: teamPlayers[listenerIdx]!.id,
      currentTeamId: nextTeam.id,
      teamSpeakerIndex: updatedIndex,
    };
  }

  if (mode === 'solo_standard') {
    let currentSpeakerIndex = -1;
    if (currentTeamId)
      currentSpeakerIndex = players.findIndex((p) => p.id === currentTeamId);
    let nextSpeakerIndex: number;
    if (isNewGame || currentSpeakerIndex === -1) {
      nextSpeakerIndex = 0;
    } else {
      nextSpeakerIndex = (currentSpeakerIndex + 1) % count;
    }
    const speakerId = players[nextSpeakerIndex]!.id;
    const listenerIndex = (nextSpeakerIndex + 1) % count;
    return {
      speakerId,
      listenerId: players[listenerIndex]!.id,
      currentTeamId: speakerId,
      teamSpeakerIndex,
    };
  }

  if (mode === 'solo_all_vs_all') {
    let currentListenerId = currentTeamId;
    let speakerId = currentTeamId;
    let listenerId;

    if (isNewGame) {
      speakerId = players[0]!.id;
      listenerId = players[1]!.id;
    } else {
      const currentListenerIndex = players.findIndex(
        (p) => p.id === currentListenerId,
      );
      const nextListenerIndex = (currentListenerIndex + 1) % count;
      listenerId = players[nextListenerIndex]!.id;

      if (speakerId === listenerId) {
        const currentSpeakerIndex = players.findIndex(
          (p) => p.id === speakerId,
        );
        const nextSpeakerIndex = (currentSpeakerIndex + 1) % count;
        speakerId = players[nextSpeakerIndex]!.id;
        const newListenerIndex = (nextSpeakerIndex + 1) % count;
        listenerId = players[newListenerIndex]!.id;
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
