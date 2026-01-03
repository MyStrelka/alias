import { createServer } from 'http';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { Server } from 'socket.io';

import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@seaborn/shared/alias';

import { words } from './data/words';
import appRoutes from './routes/app.routes';
import { initGameService } from './services/game';

const app = express();

app.set('trust proxy', 1);

const clientOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

const corsOptions = {
  origin: clientOrigin,
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ipv6Subnet: 48,
});

app.use(limiter);

app.use(express.json());

app.use('/', appRoutes);

const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: clientOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

initGameService(io);

console.log(
  `📚 Words loaded: Easy(${words.easy.length}), Medium(${words.medium.length}), Hard(${words.hard.length})`,
);

const PORT = process.env.PORT || 3000;
const server = httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

const gracefulShutdown = () => {
  console.log('Received kill signal, shutting down gracefully');

  io.close(() => {
    console.log('Socket.IO closed');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
