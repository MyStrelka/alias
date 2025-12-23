import { createServer } from 'http';
import cors from 'cors';
import express from 'express';
import session from 'express-session';
import { Server } from 'socket.io';

import { words } from './data/words';
import appRoutes from './routes/app.routes';
import { initGameService } from './services/game';

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(
  session({
    secret: 'MY_SECRET_COOKIE_KEY',
    resave: false,
    saveUninitialized: false,
  }),
);

app.use('/', appRoutes);

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
  console.log(`🚀 Server is running on port ${PORT}.`);
});
