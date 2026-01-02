// import type {
//   Difficulty,
//   Mode,
//   Player,
//   Room,
//   Team,
// } from '@seaborn/shared/alias';

// import { CHALLENGES } from '../../data/challenges';

// import { words } from '../../data/words';

export const generateRoomId = (existingRooms: string[]): string => {
  const newRoomId = Math.floor(1000 + Math.random() * 9000).toString();
  if (existingRooms.includes(newRoomId)) {
    return generateRoomId(existingRooms);
  } else {
    return newRoomId;
  }
};

// export const pickWord = (difficulty: Difficulty): string => {
//   const pool = words[difficulty] || words['medium'] || words['easy'];
//   if (!pool || pool.length === 0) return 'Слова не загружены';
//   return pool[Math.floor(Math.random() * pool.length)]!;
// };

// export const selectChallenge = (
//   roundNumber: number,
//   challengesEnabled: boolean,
// ): string | null => {
//   if (!challengesEnabled) return null;
//   if (roundNumber === 0 || roundNumber % 3 !== 0) return null;
//   return CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)] || null;
// };

// export const findRoom = (
//   rooms: Map<string, Room>,
//   connections: Map<string, string>,
//   socketId: string,
// ) => {
//   const deviceId = connections.get(socketId);
//   if (!deviceId) {
//     console.error(`[findRoom] lost connections map for socket.id=${socketId}`);
//     return null;
//   }
//   for (const [roomId, room] of rooms) {
//     if (
//       room.gameState.players.some((p) => p.deviceId === deviceId) ||
//       room.hostId === deviceId
//     )
//       return { roomId, room };
//   }
//   return null;
// };

// export const getNewTeamId = (
//   teams: Room['gameState']['teams'],
// ): number | null => {
//   if (teams.length === 0) return 1;

//   const lastTeam = teams.sort((a, b) => `${b.id}`.localeCompare(`${a.id}`))[0]
//     ?.id;
//   if (!lastTeam) return null;

//   const match = lastTeam.match(/\d+/);
//   const index = match ? parseInt(match[0], 10) + 1 : null;

//   return index;
// };

// export const nextTeamTurn = (
//   teams: Team[],
//   players: Player[],
//   currentTeamId: string | null,
//   teamSpeakerIndex: Record<string, number>,
//   mode: Mode,
//   isNewGame = false,
// ) => {
//   const count = players.length;
//   if (count < 2 && mode !== 'team') return {};

//   if (mode === 'team') {
//     const validTeams = teams.filter((t) => t.playerIds.length >= 2);
//     if (validTeams.length === 0) return {};

//     let currentTeamIdx = -1;
//     if (currentTeamId)
//       currentTeamIdx = validTeams.findIndex((t) => t.id === currentTeamId);

//     let nextTeamIdx;
//     if (isNewGame || currentTeamIdx === -1) {
//       nextTeamIdx = 0;
//     } else {
//       nextTeamIdx = (currentTeamIdx + 1) % validTeams.length;
//     }

//     const nextTeam = validTeams[nextTeamIdx];
//     // TODO: possibly false
//     if (!nextTeam) return {};

//     const teamPlayers = players
//       .filter((p) => p.teamId === nextTeam.id)
//       .sort((a, b) => a.name.localeCompare(b.name));

//     if (teamPlayers.length < 2) return {};

//     const speakerIdx = teamSpeakerIndex[nextTeam!.id] || 0;
//     const nextSpeakerIdx = (speakerIdx + 1) % teamPlayers.length;
//     const listenerIdx = (nextSpeakerIdx + 1) % teamPlayers.length;

//     const updatedIndex = { ...teamSpeakerIndex, [nextTeam.id]: nextSpeakerIdx };

//     return {
//       speakerId: teamPlayers[nextSpeakerIdx]!.deviceId,
//       listenerId: teamPlayers[listenerIdx]!.deviceId,
//       currentTeamId: nextTeam.id,
//       teamSpeakerIndex: updatedIndex,
//     };
//   }

//   if (mode === 'solo_standard') {
//     let currentSpeakerIndex = -1;
//     if (currentTeamId)
//       currentSpeakerIndex = players.findIndex(
//         (p) => p.deviceId === currentTeamId,
//       );
//     let nextSpeakerIndex: number;
//     if (isNewGame || currentSpeakerIndex === -1) {
//       nextSpeakerIndex = 0;
//     } else {
//       nextSpeakerIndex = (currentSpeakerIndex + 1) % count;
//     }
//     const speakerId = players[nextSpeakerIndex]!.deviceId;
//     const listenerIndex = (nextSpeakerIndex + 1) % count;
//     return {
//       speakerId,
//       listenerId: players[listenerIndex]!.deviceId,
//       currentTeamId: speakerId,
//       teamSpeakerIndex,
//     };
//   }

//   if (mode === 'solo_all_vs_all') {
//     let currentListenerId = currentTeamId;
//     let speakerId = currentTeamId;
//     let listenerId;

//     if (isNewGame) {
//       speakerId = players[0]!.deviceId;
//       listenerId = players[1]!.deviceId;
//     } else {
//       const currentListenerIndex = players.findIndex(
//         (p) => p.deviceId === currentListenerId,
//       );
//       const nextListenerIndex = (currentListenerIndex + 1) % count;
//       listenerId = players[nextListenerIndex]!.deviceId;

//       if (speakerId === listenerId) {
//         const currentSpeakerIndex = players.findIndex(
//           (p) => p.deviceId === speakerId,
//         );
//         const nextSpeakerIndex = (currentSpeakerIndex + 1) % count;
//         speakerId = players[nextSpeakerIndex]!.deviceId;
//         const newListenerIndex = (nextSpeakerIndex + 1) % count;
//         listenerId = players[newListenerIndex]!.deviceId;
//       }
//     }
//     return {
//       speakerId,
//       listenerId,
//       currentTeamId: speakerId,
//       teamSpeakerIndex,
//     };
//   }
//   return {};
// };

// export const removeTeamAndMigratePlayers = (
//   room: Room,
//   teamIdToRemove: string,
// ): Room => {
//   // 1. Делаем глубокую копию, чтобы не мутировать входящий объект напрямую
//   // (Если у вас старая среда без structuredClone, используйте lodash.cloneDeep или JSON.parse/stringify)
//   const newRoom = structuredClone(room);
//   const { gameState } = newRoom;

//   // 2. Проверяем, существует ли удаляемая команда
//   const teamIndexToRemove = gameState.teams.findIndex(
//     (t) => t.id === teamIdToRemove,
//   );
//   if (teamIndexToRemove === -1) {
//     console.warn(`Team with id ${teamIdToRemove} not found.`);
//     return room;
//   }

//   // 3. Находим целевую команду (первая, которая НЕ является удаляемой)
//   const targetTeam = gameState.teams.find((t) => t.id !== teamIdToRemove);

//   // Если других команд нет, просто удаляем текущую (игроки остаются без команды)
//   if (!targetTeam) {
//     gameState.teams.splice(teamIndexToRemove, 1);
//     gameState.players.forEach((p) => {
//       if (p.teamId === teamIdToRemove) p.teamId = undefined; // или null, зависит от типов
//     });
//     return newRoom;
//   }

//   // 4. Находим игроков, которые сейчас в удаляемой команде
//   // (лучше фильтровать по players, чтобы гарантировать синхронность данных)
//   const playersToMove = gameState.players.filter(
//     (p) => p.teamId === teamIdToRemove,
//   );

//   // 5. Перемещаем игроков
//   playersToMove.forEach((player) => {
//     // Обновляем ссылку на команду у игрока
//     player.teamId = targetTeam.id;

//     // Добавляем deviceId игрока в массив playerIds целевой команды
//     // Проверка !includes нужна, чтобы избежать дубликатов
//     if (!targetTeam.playerIds.includes(player.deviceId)) {
//       targetTeam.playerIds.push(player.deviceId);
//     }
//   });

//   // 6. Удаляем старую команду из массива
//   gameState.teams.splice(teamIndexToRemove, 1);

//   return newRoom;
// };
