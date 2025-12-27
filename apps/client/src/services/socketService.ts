import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'localhost:3000';

interface PlayerData {
  playerName: string;
  dbId: string | null;
  avatar: string | null;
  deviceId: string;
  userProviderId: string;
}
interface JoinData {
  roomId: string;
  playerName: string;
  dbId: string | null;
  avatar: string | null;
  deviceId: string;
  userProviderId: string;
}

class SocketService {
  socket: Socket | null = null;
  private messageHandler: ((type: string, payload: any) => void) | null = null;
  private isActive = false;

  connect() {
    if (!this.socket) {
      this.socket = io(SERVER_URL, {
        transports: ['websocket'],
        autoConnect: false,
      });
    }

    if (this.socket.connected) return;

    this.socket.removeAllListeners('state_update');
    this.socket.removeAllListeners('connect');
    this.socket.removeAllListeners('disconnect');

    this.socket.on('connect', () => {
      console.log('✅ [Socket] Connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ [Socket] Disconnected');
      toast.error('Связь с сервером потеряна');
      if (this.isActive) {
        console.log('пробуем переподключиться');
        this.socket?.connect();
      }
    });

    this.socket.on('state_update', (gameState) => {
      console.log('📥 [Socket] Received state_update:', gameState);
      if (this.messageHandler) {
        this.messageHandler('state', gameState);
      }
    });

    this.socket.connect();
  }

  waitForConnection(): Promise<void> {
    return new Promise((resolve) => {
      if (this.socket?.connected) return resolve();
      this.socket?.once('connect', resolve);
    });
  }

  reliableEmit(event: string, data?: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
      console.log(`📤 [Socket] EMIT: ${event}`, data);
    } else {
      console.warn(`⚠️ [Socket] Cannot emit ${event}: Disconnected`);
    }
  }

  async createRoom(data: PlayerData): Promise<string> {
    this.connect();
    await this.waitForConnection();

    return new Promise((resolve, reject) => {
      this.socket?.emit('create_room', data, (response: any) => {
        if (response.success) {
          this.isActive = true;
          resolve(response.roomId);
        } else {
          reject(response.message);
        }
      });
    });
  }

  async joinRoom(data: JoinData): Promise<void> {
    this.connect();
    await this.waitForConnection();

    return new Promise((resolve, reject) => {
      this.socket?.emit('join_room', data, (response: any) => {
        if (response.success) {
          this.isActive = true;
          resolve();
        } else {
          reject(response.message);
        }
      });
    });
  }

  createTeam() {
    this.reliableEmit('create_team');
  }
  joinTeam(teamId: string) {
    this.reliableEmit('join_team', teamId);
  }
  close() {
    this.isActive = false;
    this.socket?.disconnect();
  }

  setHandler(fn: (type: string, payload: any) => void) {
    console.log('🔧 [Socket] Handler attached');
    this.messageHandler = fn;
  }
}

export const socketService = new SocketService();
