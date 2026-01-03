import { Server } from 'socket.io';

import type { User } from '@seaborn/shared/root';

import { AliasRoom } from './alias/Room';
import { generateRoomId } from './utils';

export const findRoom = (
  rooms: Map<string, AliasRoom>,
  connections: Map<string, { deviceId: string; lastJoin: number }>,
  socketId: string,
) => {
  const connection = connections.get(socketId);
  if (!connection) {
    console.error(`[findRoom] lost connections map for socket.id=${socketId}`);
    return null;
  }
  for (const [roomId, room] of rooms) {
    const { players } = room.getState();
    if (
      players.some((p) => p.deviceId === connection.deviceId) ||
      room.hostDeviceId === connection.deviceId
    )
      return { roomId, room };
  }
  return null;
};

const rooms = new Map<string, AliasRoom>();

export const modifyCustomWords = (
  roomId: string,
  topic: string,
  words: string[],
) => {
  const room = rooms.get(roomId);
  if (room) {
    room.modifyCustomWords(topic, words);
  }
};

export const initGameService = (io: Server) => {
  io.on('connection', (socket) => {
    socket.on('create_room', (data: { deviceId: string; user: User }) => {
      const { deviceId, user } = data;

      const newRoomId = generateRoomId([...rooms.keys()]);

      rooms.set(
        newRoomId,
        new AliasRoom(newRoomId, user, socket.id, deviceId, io),
      );

      const room = rooms.get(newRoomId);

      if (room) {
        room.bindSocket(socket);

        console.log(
          `User ${user.playerName} (${socket.id}) created room ${newRoomId}`,
        );

        io.to(newRoomId).emit('room_updated', room.getState());
      }
    });

    socket.on(
      'join_room',
      (data: { deviceId: string; roomId: string; user: User }) => {
        const { deviceId, roomId, user } = data;

        const room = rooms.get(roomId);

        if (room) {
          room.setConnections(socket.id, { deviceId, lastJoin: Date.now() });
          room.bindSocket(socket);
          room.dispatch(socket.id, {
            type: 'PLAYER_JOIN_ROOM',
            payload: { socketId: socket.id, roomId, user },
          });
          console.log(
            `User ${user.playerName} (${socket.id}) joined room ${roomId}`,
          );
        }
      },
    );

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);

      //   // remove room if all players are offline
      //   // TODO: make delay for empty rooms delition - give a chance to reconnect for offline players
      //   const state = room.getState();
      //   if (state.players.filter((p) => p.online).length === 0) {
      //     rooms.delete(roomId);
      //     console.log(`Room ${roomId} deleted because it's empty.`);
      //   }
      // }
    });
  });
};
