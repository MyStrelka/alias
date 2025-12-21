import { Server } from 'socket.io';
import type { GameState, Room } from '@alias/shared';
import { EVENTS } from '@alias/shared';
import {
  generateRoomId,
  findRoom,
  nextTeamTurn,
  selectChallenge,
  pickWord,
} from './utils';

const rooms = new Map<string, Room>();

const createInitialState = (): GameState => ({
  stage: 'lobby',
  settings: {
    difficulty: 'medium',
    roundTime: 60,
    winScore: 30,
    mode: 'team',
    enableChallenges: true,
  },
  players: [],
  teams: [
    { id: 'team-1', name: 'Команда 1', playerIds: [], score: 0, themeIndex: 0 },
    { id: 'team-2', name: 'Команда 2', playerIds: [], score: 0, themeIndex: 1 },
  ],
  round: {
    roundNumber: 0,
    timeLeft: 60,
    running: false,
    currentWord: '...',
    activeChallenge: null,
    readyMap: {},
    teamSpeakerIndex: {},
    currentTeamId: null,
    speakerId: null,
    listenerId: null,
  },
});

export const initGameService = (io: Server) => {
  // TODO: type for room
  const updateState = (roomId: string, room: any) =>
    io.to(roomId).emit('state_update', room.gameState);

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // 1. Создание
    socket.on(EVENTS.CREATE_ROOM, (data, callback) => {
      const roomId = generateRoomId();
      const initialState = createInitialState();

      const host = {
        id: socket.id,
        userId: data.userId,
        name: data.playerName,
        score: 0,
        isHost: true,
        ready: false,
        dbId: data.dbId || null,
        avatar: data.avatar || null,
        explained: 0,
        guessed: 0,
        online: true,
      };
      initialState.players.push(host);
      rooms.set(roomId, {
        hostId: socket.id,
        gameState: initialState,
        players: [host],
      });
      socket.join(roomId);
      callback({ success: true, roomId });
      io.to(roomId).emit(EVENTS.STATE_UPDATE, initialState);
    });

    // 2. Вход (С ПОЛНОЙ МИГРАЦИЕЙ ID)
    socket.on(
      EVENTS.JOIN_ROOM,
      ({ roomId, playerName, dbId, avatar, userId }, callback) => {
        const roomData = rooms.get(roomId);
        if (!roomData)
          return callback({ success: false, message: 'Комната не найдена' });

        const { gameState, players } = roomData;
        const existingPlayer = players.find((p) => p.userId === userId);

        if (existingPlayer) {
          console.log(
            `♻️ Player ${playerName} reconnected! Migrating ID: ${existingPlayer.id} -> ${socket.id}`,
          );
          const oldSocketId = existingPlayer.id;

          existingPlayer.id = socket.id;
          existingPlayer.online = true;

          if (existingPlayer.isHost) {
            roomData.hostId = socket.id;
          }

          if (gameState.round.speakerId === oldSocketId)
            gameState.round.speakerId = socket.id;
          if (gameState.round.listenerId === oldSocketId)
            gameState.round.listenerId = socket.id;
          gameState.teams.forEach((t) => {
            const idx = t.playerIds.indexOf(oldSocketId);
            if (idx !== -1) t.playerIds[idx] = socket.id;
          });
          if (gameState.round.readyMap[oldSocketId]) {
            gameState.round.readyMap[socket.id] =
              gameState.round.readyMap[oldSocketId];
            delete gameState.round.readyMap[oldSocketId];
          }

          socket.join(roomId);
          callback({ success: true });
        } else {
          const newPlayer = {
            id: socket.id,
            userId: userId,
            name: playerName,
            score: 0,
            isHost: false,
            ready: false,
            dbId: dbId || null,
            avatar: avatar || null,
            explained: 0,
            guessed: 0,
            online: true,
          };
          gameState.players.push(newPlayer);
          players.push(newPlayer);
          socket.join(roomId);
          callback({ success: true });
        }

        io.to(roomId).emit('state_update', gameState);
      },
    );

    // 🔥 KICK PLAYER
    socket.on('kick_player', (targetId) => {
      const data = findRoom(rooms, socket.id);
      if (!data || data.room.hostId !== socket.id) return; // Только хост
      const { roomId, room } = data;

      console.log(`🔨 Kicking player: ${targetId} from room ${roomId}`);

      // Удаляем из списка игроков
      room.gameState.players = room.gameState.players.filter(
        (p) => p.id !== targetId,
      );
      room.players = room.players.filter((p) => p.id !== targetId);

      // Удаляем из команд
      room.gameState.teams.forEach((t) => {
        t.playerIds = t.playerIds.filter((id) => id !== targetId);
      });

      // Отправляем обновление (клиент с targetId увидит, что его нет, и выйдет)
      updateState(roomId, room);
    });

    socket.on('toggle_ready', () => {
      const data = findRoom(rooms, socket.id);
      if (!data) return;
      const p = data.room.gameState.players.find((p) => p.id === socket.id);
      if (p) {
        p.ready = !p.ready;
        updateState(data.roomId, data.room);
      }
    });
    socket.on('update_settings', (s) => {
      const data = findRoom(rooms, socket.id);
      if (data && data.room.hostId === socket.id) {
        data.room.gameState.settings = {
          ...data.room.gameState.settings,
          ...s,
        };
        updateState(data.roomId, data.room);
      }
    });
    socket.on('create_team', () => {
      const data = findRoom(rooms, socket.id);
      if (data && data.room.hostId === socket.id) {
        const r = data.room;
        if (r.gameState.teams.length >= 5) return;
        const idx = r.gameState.teams.length;
        r.gameState.teams.push({
          id: `team-${idx + 1}`,
          name: `Команда ${idx + 1}`,
          playerIds: [],
          score: 0,
          themeIndex: idx,
        });
        updateState(data.roomId, r);
      }
    });
    socket.on('join_team', (tid) => {
      const data = findRoom(rooms, socket.id);
      if (!data) return;
      const { room } = data;
      const p = room.gameState.players.find((p) => p.id === socket.id);
      if (!p) return;
      room.gameState.teams.forEach(
        (t) => (t.playerIds = t.playerIds.filter((id) => id !== p.id)),
      );
      const t = room.gameState.teams.find((t) => t.id === tid);
      if (t) {
        p.teamId = tid;
        t.playerIds.push(p.id);
      }
      updateState(data.roomId, room);
    });
    socket.on('shuffle_teams', () => {
      const data = findRoom(rooms, socket.id);
      if (data && data.room.hostId === socket.id) {
        const r = data.room;
        r.gameState.teams.forEach((t) => (t.playerIds = []));
        const sh = [...r.gameState.players].sort(() => Math.random() - 0.5);
        sh.forEach((p, i) => {
          const t = r.gameState.teams[i % r.gameState.teams.length]!;
          p.teamId = t.id;
          t.playerIds.push(p.id);
        });
        updateState(data.roomId, r);
      }
    });

    socket.on('start_game', () => {
      const data = findRoom(rooms, socket.id);
      if (!data || data.room.hostId !== socket.id) return;
      const { roomId, room } = data;
      const turn = nextTeamTurn(
        room.gameState.teams,
        room.gameState.players,
        room.gameState.round.currentTeamId,
        room.gameState.round.teamSpeakerIndex,
        room.gameState.settings.mode,
        true,
      );
      const ch = selectChallenge(1, room.gameState.settings.enableChallenges);
      room.gameState.stage = 'preround';
      room.gameState.round = {
        ...room.gameState.round,
        ...turn,
        roundNumber: 1,
        timeLeft: room.gameState.settings.roundTime,
        running: false,
        readyMap: {},
        currentWord: pickWord(room.gameState.settings.difficulty),
        activeChallenge: ch,
      };
      updateState(roomId, room);
    });

    socket.on(
      'round_ready',
      ({ playerId, status }: { playerId: string; status: boolean }) => {
        const data = findRoom(rooms, socket.id);
        if (!data) return;
        data.room.gameState.round.readyMap[playerId] = status;
        updateState(data.roomId, data.room);
      },
    );

    socket.on('start_round', () => {
      const data = findRoom(rooms, socket.id);
      if (!data) return;
      const { roomId, room } = data;
      const { round } = room.gameState;
      if (!round.speakerId || !round.listenerId) return;
      if (!round.readyMap[round.speakerId] || !round.readyMap[round.listenerId])
        return;

      room.gameState.stage = 'play';
      room.gameState.round.running = true;
      room.gameState.round.timeLeft = room.gameState.settings.roundTime;
      updateState(roomId, room);

      if (room.timerInterval) clearInterval(room.timerInterval);
      room.timerInterval = setInterval(() => {
        if (!room.gameState.round.running) return;
        room.gameState.round.timeLeft -= 1;
        if (room.gameState.round.timeLeft <= 0) {
          clearInterval(room.timerInterval);
          const nextNum = room.gameState.round.roundNumber + 1;
          const turn = nextTeamTurn(
            room.gameState.teams,
            room.gameState.players,
            room.gameState.round.currentTeamId,
            room.gameState.round.teamSpeakerIndex,
            room.gameState.settings.mode,
            false,
          );
          const ch = selectChallenge(
            nextNum,
            room.gameState.settings.enableChallenges,
          );
          room.gameState.stage = 'preround';
          room.gameState.round = {
            ...room.gameState.round,
            ...turn,
            roundNumber: nextNum,
            running: false,
            readyMap: {},
            timeLeft: room.gameState.settings.roundTime,
            currentWord: pickWord(room.gameState.settings.difficulty),
            activeChallenge: ch,
          };
        }
        updateState(roomId, room);
      }, 1000);
    });

    socket.on('toggle_pause', () => {
      const data = findRoom(rooms, socket.id);
      if (data) {
        data.room.gameState.round.running = !data.room.gameState.round.running;
        updateState(data.roomId, data.room);
      }
    });

    socket.on('game_action', (action) => {
      const data = findRoom(rooms, socket.id);
      if (!data) return;
      const { roomId, room } = data;
      const sp = room.gameState.players.find(
        (p) => p.id === room.gameState.round.speakerId,
      );
      const ls = room.gameState.players.find(
        (p) => p.id === room.gameState.round.listenerId,
      );
      if (action === 'correct') {
        if (sp) {
          sp.score++;
          sp.explained++;
        }
        if (ls) {
          ls.score++;
          ls.guessed++;
        }
      } else if (action === 'skip') {
        if (sp) sp.score--;
      }

      const winner = room.gameState.players.find(
        (p) => p.score >= room.gameState.settings.winScore,
      );
      if (winner) {
        if (room.timerInterval) clearInterval(room.timerInterval);
        room.gameState.stage = 'victory';
        room.gameState.victory = { winnerId: winner.id };
      } else {
        room.gameState.round.currentWord = pickWord(
          room.gameState.settings.difficulty,
        );
      }
      updateState(roomId, room);
    });

    socket.on('restart', () => {
      const data = findRoom(rooms, socket.id);
      if (!data || data.room.hostId !== socket.id) return;
      if (data.room.timerInterval) clearInterval(data.room.timerInterval);
      const ns = createInitialState();
      ns.players = data.room.gameState.players.map((p) => ({
        ...p,
        score: 0,
        explained: 0,
        guessed: 0,
        ready: false,
      }));
      ns.teams = data.room.gameState.teams;
      ns.settings = data.room.gameState.settings;
      data.room.gameState = ns;
      updateState(data.roomId, data.room);
    });

    socket.on('disconnect', () => {
      const data = findRoom(rooms, socket.id);
      if (data) {
        const { roomId, room } = data;
        const player = room.gameState.players.find((p) => p.id === socket.id);
        if (player) {
          console.log(`User ${player.name} disconnected. Keeping...`);
          player.online = false;
          player.ready = false;
        }
        io.to(roomId).emit('state_update', room.gameState);
      }
    });
  });
};
