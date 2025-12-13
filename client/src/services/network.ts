import Peer, { type DataConnection } from "peerjs";
import toast from "react-hot-toast";

// ==========================================
// ⚙️ НАСТРОЙКИ СЕТИ
// ==========================================

// Если поднимешь свой сервер, впиши домен (без https://)
const MY_LINUX_SERVER_DOMAIN: string | null = null;

// Префикс для уникальности
const PEER_PREFIX = "alias-";

// ==========================================

export type NetMessage =
  | { type: "join"; name: string; clientId: string }
  | { type: "state"; payload: any }
  | { type: "toggle-ready"; playerId: string }
  | { type: "update-settings"; payload: any }
  | { type: "start-game" }
  | { type: "round-ready"; playerId: string; status: boolean }
  | { type: "start-round-request" }
  | { type: "handle-correct-request" }
  | { type: "handle-skip-request" }
  | { type: "toggle-pause" }
  | { type: "create-team"; playerId: string }
  | { type: "join-team"; playerId: string; teamId: string }
  | { type: "shuffle-teams" }
  | { type: "restart" }
  | { type: "request-sync" }
  | { type: "kick-notification"; playerId: string };

type Handler = (peerId: string, msg: NetMessage) => void;

// --- КОНФИГУРАЦИЯ ---
const getPeerConfig = () => {
  const baseConfig = {
    debug: 1, // Уменьшил уровень логов, чтобы не спамило
    secure: true,
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" },
      ],
      iceCandidatePoolSize: 10,
    },
  };

  if (MY_LINUX_SERVER_DOMAIN) {
    return {
      ...baseConfig,
      host: MY_LINUX_SERVER_DOMAIN,
      port: 443,
      path: "/",
      key: "alias",
    };
  } else {
    return {
      ...baseConfig,
      host: "0.peerjs.com",
      port: 443,
      path: "/",
      // УБРАЛ pingInterval, он вызывал ошибки на публичном сервере
    };
  }
};

class NetworkService {
  peer: Peer | null = null;
  conns: Map<string, DataConnection> = new Map();
  selfId: string = "";
  handler: Handler | null = null;
  isHost = false;

  private generateShortId(): string {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${PEER_PREFIX}${num}`;
  }

  async createHost(customId?: string): Promise<string> {
    this.isHost = true;
    if (this.peer) this.peer.destroy();

    return new Promise((resolve, reject) => {
      const id = customId || this.generateShortId();

      try {
        this.peer = new Peer(id, getPeerConfig());
      } catch (e) {
        reject(e);
        return;
      }

      this.peer.on("open", (id) => {
        console.log("✅ [Host] ID:", id);
        this.selfId = id;
        resolve(id);
      });

      this.peer.on("connection", (conn) => {
        this.conns.set(conn.peer, conn);
        this.setupConn(conn);
      });

      this.peer.on("error", (err) => {
        console.error("❌ [Host] Error:", err);
        if (err.type === "unavailable-id") {
          this.createHost().then(resolve).catch(reject);
        } else if (err.type === "peer-unavailable") {
          // Игнорируем, если кто-то отключился
        } else {
          // Критическая ошибка сети
          if (this.conns.size === 0) {
            // Только если никого нет, можно попробовать пересоздать
            // reject(err)
          }
        }
      });

      this.peer.on("disconnected", () => {
        console.warn("⚠️ [Host] Disconnected. Reconnecting...");
        // Небольшая задержка перед реконнектом
        setTimeout(() => this.peer?.reconnect(), 1000);
      });
    });
  }

  async join(shortId: string): Promise<void> {
    this.isHost = false;
    if (this.peer) this.peer.destroy();

    const fullId = shortId.startsWith(PEER_PREFIX)
      ? shortId
      : `${PEER_PREFIX}${shortId}`;

    return new Promise((resolve, reject) => {
      try {
        this.peer = new Peer(getPeerConfig());
      } catch (e) {
        reject(e);
        return;
      }

      this.peer.on("open", (id) => {
        this.selfId = id;

        const conn = this.peer!.connect(fullId, {
          reliable: true,
          serialization: "json",
        });

        const timeout = setTimeout(() => {
          conn.close();
          const errText = "Не удалось найти комнату. Проверьте код.";
          toast.error(errText);
          reject(new Error(errText));
        }, 15000);

        conn.on("open", () => {
          clearTimeout(timeout);
          console.log("🚀 Connected to:", fullId);
          this.conns.set(fullId, conn);
          this.setupConn(conn);
          resolve();
        });

        conn.on("error", (err) => {
          clearTimeout(timeout);
          reject(err);
        });

        conn.on("close", () => {
          clearTimeout(timeout);
        });
      });

      this.peer.on("error", (err) => reject(err));
    });
  }

  close() {
    this.conns.forEach((conn) => conn.close());
    this.conns.clear();
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.selfId = "";
    this.isHost = false;
    this.handler = null;
  }

  private setupConn(conn: DataConnection) {
    conn.on("data", (data) => {
      if (this.handler) this.handler(conn.peer, data as NetMessage);
    });
    conn.on("close", () => {
      this.conns.delete(conn.peer);
    });
    conn.on("error", (err) => console.error("Conn error:", err));
  }

  setHandler(fn: Handler) {
    this.handler = fn;
  }

  // БЕЗОПАСНАЯ ОТПРАВКА: Проверяем, открыт ли канал
  sendToHost(msg: NetMessage) {
    this.conns.forEach((conn) => {
      if (conn.open) conn.send(msg);
    });
  }

  broadcast(msg: NetMessage) {
    this.conns.forEach((conn) => {
      if (conn.open) conn.send(msg);
    });
  }
}

export const network = new NetworkService();
