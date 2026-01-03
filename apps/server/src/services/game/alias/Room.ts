import { Server, Socket } from 'socket.io';

import type { GameState, Settings, WordLog } from '@seaborn/shared/alias';
import type { User } from '@seaborn/shared/root';

import { initialState, roomReducer } from './roomReducer';
import type { GameAction } from './roomReducer';

type Connection = {
  deviceId: string;
  lastJoin: number;
};

export class AliasRoom {
  private state: GameState;
  private connections: Map<string, Connection> = new Map();
  private timerInterval: NodeJS.Timeout | undefined;

  constructor(
    public id: string,
    public hostUser: User,
    public hostSocketId: string,
    public hostDeviceId: string,
    private io: Server,
  ) {
    this.state = { ...initialState, roomId: id, hostId: hostDeviceId };

    this.connections.set(hostSocketId, {
      deviceId: hostDeviceId,
      lastJoin: Date.now(),
    });

    this.dispatch(hostSocketId, {
      type: 'PLAYER_JOIN_ROOM',
      payload: {
        socketId: hostSocketId,
        roomId: id,
        user: hostUser,
        hostId: hostDeviceId,
      },
    });
  }

  public destroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.connections.clear();
  }

  public getState() {
    return this.state;
  }

  public setConnections(socketId: string, connection: Connection) {
    this.connections.set(socketId, connection);
  }

  public dispatch(socketId: string, action: GameAction) {
    const deviceId = this.connections.get(socketId)?.deviceId;
    if (deviceId) {
      console.log(
        `[Room] dispatch: [${action.type}] deviceId: ${deviceId} | socketId: ${socketId}`,
      );
      const nextState = roomReducer(this.state, action, deviceId);
      if (nextState !== this.state) {
        this.state = nextState;
        this.broadcast();
      }
    }
  }

  public dispatchAll(socketId: string, actions: GameAction[]) {
    const deviceId = this.connections.get(socketId)?.deviceId;
    console.log(
      `[Room] dispatchAll: [${actions.map((a) => a.type).join(' | ')}] deviceId, ${deviceId}`,
    );

    if (!deviceId) return;

    let nextState = this.state;
    actions.forEach((action) => {
      nextState = roomReducer(nextState, action, deviceId);
    });

    if (nextState !== this.state) {
      this.state = nextState;
      this.broadcast();
    }
  }

  private dispatchSystem(action: GameAction) {
    const nextState = roomReducer(this.state, action, 'system_dispatch');
    if (nextState !== this.state) {
      this.state = nextState;
      this.broadcast();
    }
  }

  private broadcast() {
    this.io.to(this.id).emit('room_updated', this.state);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }

  private startTimer() {
    this.timerInterval = setInterval(() => {
      // Важно проверять актуальный стейт
      if (!this.state.round.running) {
        this.stopTimer();
        return;
      }

      const timeLeft = this.state.round.timeLeft - 1;
      if (timeLeft <= 0) {
        this.stopTimer();
        this.dispatchSystem({ type: 'ROUND_OVER' });
      } else {
        this.dispatchSystem({ type: 'ROUND_TIMER' });
      }
    }, 1000);
  }

  public bindSocket(socket: Socket) {
    socket.join(this.id);

    // Отправляем текущее состояние новому игроку
    // socket.emit('room_updated', this.state);

    socket.on('update_settings', (settings: Settings) => {
      this.dispatch(socket.id, {
        type: 'UPDATE_SETTINGS',
        payload: { settings },
      });
    });
    socket.on('shuffle_teams', () => {
      this.dispatch(socket.id, {
        type: 'SHUFFLE_TEAMS',
      });
    });
    socket.on('round_ready', (data: { deviceId: string; status: boolean }) => {
      this.dispatch(socket.id, {
        type: 'MARK_ROUND_READY',
        payload: data,
      });
    });
    socket.on('join_team', (data: { deviceId: string; teamId: string }) => {
      this.dispatchAll(socket.id, [
        {
          type: 'LEAVE_TEAM',
        },
        {
          type: 'JOIN_TEAM',
          payload: data,
        },
      ]);
    });
    socket.on('kick_player', (data: { targetId: string }) => {
      this.dispatch(socket.id, {
        type: 'KICK_PLAYER',
        payload: data,
      });
    });
    socket.on('create_team', () => {
      this.dispatch(socket.id, {
        type: 'CREATE_TEAM',
      });
    });
    socket.on('delete_team', ({ teamId }) => {
      this.dispatch(socket.id, {
        type: 'DELETE_TEAM',
        payload: { teamId },
      });
    });
    socket.on('toggle_ready', () => {
      this.dispatch(socket.id, {
        type: 'TOGGLE_READY',
      });
    });
    socket.on('start_game', () => {
      this.dispatch(socket.id, {
        type: 'START_GAME',
      });
    });
    socket.on('start_round', () => {
      if (this.state.round.running) return;

      this.dispatch(socket.id, {
        type: 'START_ROUND',
      });

      this.stopTimer();
      this.startTimer();
    });
    socket.on('toggle_pause', () => {
      this.dispatch(socket.id, {
        type: 'TOGGLE_PAUSE',
      });
    });
    socket.on('game_action', (action) => {
      this.dispatch(socket.id, {
        type: 'GAME_ACTION',
        payload: { action },
      });
    });
    socket.on('finish_round', () => {
      this.dispatch(socket.id, {
        type: 'FINISH_ROUND',
      });

      const winner = this.state.players.find(
        (player) => player.score >= this.state.settings.winScore,
      );
      if (winner) {
        this.stopTimer();
        this.dispatch(socket.id, {
          type: 'VICTORY',
          payload: { winnerId: winner.deviceId },
        });
      } else {
        this.dispatch(socket.id, {
          type: 'NEXT_ROUND',
        });
      }
    });
    socket.on(
      'word_adjustment',
      ({
        wordLogIndex,
        score,
      }: {
        wordLogIndex: number;
        score: WordLog['score'];
      }) => {
        this.dispatch(socket.id, {
          type: 'WORD_ADJUSTMENT',
          payload: { wordLogIndex, score },
        });
      },
    );
    socket.on('custom_words_clear', () => {
      this.dispatch(socket.id, {
        type: 'CUSTOM_WORDS_CLEAR',
      });
    });

    socket.on('disconnect', () => {
      console.log('ROOM disconnect');
      this.dispatchAll(socket.id, [
        {
          type: 'SET_PLAYER_OFFLINE',
        },
        {
          type: 'LEAVE_TEAM',
        },
      ]);
      this.connections.delete(socket.id);
    });
  }

  public modifyCustomWords(topic: string, words: string[]) {
    this.dispatchSystem({
      type: 'CUSTOM_WORDS_MODIFY',
      payload: { topic, words },
    });
  }
}
