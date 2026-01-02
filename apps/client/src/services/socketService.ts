import { io, Socket } from 'socket.io-client';

import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@seaborn/shared/alias';
import type { User } from '@seaborn/shared/root';

class SocketService {
  public socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private onUpdateHandler: ((data: any) => void) | null = null;

  constructor() {
    // Гарантируем отключение при перезагрузке страницы/закрытии вкладки
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.disconnect();
      });
    }
  }

  connect(
    deviceId: string,
    user: User,
    roomId: string | null,
    onUpdate: (data: any) => void,
  ) {
    if (this.socket?.connected) return;
    if (this.socket) {
      this.disconnect();
    }

    console.log('CALL connect');
    this.onUpdateHandler = onUpdate;

    this.socket = io('http://localhost:3000', {
      reconnection: true,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected:', this.socket?.id);
      console.log('[connect] roomId', roomId);
      if (roomId) {
        console.log('call join_room');
        this.socket?.emit('join_room', { deviceId, user, roomId });
      } else {
        console.log('call create_room');
        this.socket?.emit('create_room', {
          deviceId,
          user,
        });
      }
    });

    this.socket.on('room_updated', (room) => {
      if (this.onUpdateHandler) this.onUpdateHandler(room);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected:', reason);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.close();
      this.socket = null;
      this.onUpdateHandler = null;
    }
  }
}

export const socketService = new SocketService();
