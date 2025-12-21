import { createServer } from 'http';
import cors from 'cors';
import express from 'express';
import { Server } from 'socket.io';

import { words } from './data/words';
import { initGameService } from './services/game';

const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

initGameService(io);

console.log(
  `📚 Words loaded: Easy(${words.easy.length}), Medium(${words.medium.length}), Hard(${words.hard.length})`,
);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
