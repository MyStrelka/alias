import { useEffect, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';

import type { Player } from '@alias/shared';

import Header from './components/Header';
import Game from './pages/Game';
import Lobby from './pages/Lobby';
import Login from './pages/Login';
import PreRound from './pages/PreRound';
import Victory from './pages/Victory';
import { useGameStore } from './store/gameStore';

import './index.css';

import MessageListener from './components/MessageListener';

function App() {
  const game = useGameStore();
  const { actions } = game;

  useEffect(() => {
    const session = actions.restoreSession();
    if (session) {
      actions.joinRoom(session.selfName, session.roomId);
    }
  }, []);

  const speaker = useMemo(
    () => game.players.find((p: Player) => p.id === game.round.speakerId),
    [game.players, game.round.speakerId],
  );
  const listener = useMemo(
    () => game.players.find((p: Player) => p.id === game.round.listenerId),
    [game.players, game.round.listenerId],
  );
  const winner = useMemo(() => {
    if (game.settings.mode === 'team')
      return game.teams.find((t) => t.id === game.victory?.winnerId);
    return game.players.find((p) => p.id === game.victory?.winnerId);
  }, [game.victory?.winnerId, game.settings.mode, game.teams, game.players]);

  return (
    <div className='min-h-screen w-full relative overflow-x-hidden text-text-main font-sans selection:bg-accent-main/30'>
      <Toaster
        position='top-center'
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
      <div className='fixed inset-0 z-[-1] overflow-hidden pointer-events-none'>
        <div className='absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] animate-blob' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-main/20 rounded-full blur-[100px] animate-blob animation-delay-2000' />
      </div>
      <MessageListener />
      <Header
        stage={game.stage}
        roomId={game.roomId}
        actions={game.actions}
        isMuted={game.isMuted}
      />

      <main className='max-w-7xl mx-auto px-4 py-4 md:py-8 pb-20'>
        {game.stage === 'login' && <Login />}
        {game.stage === 'lobby' && (
          <Lobby
            roomId={game.roomId}
            settings={game.settings}
            players={game.players}
            teams={game.teams}
            isHost={game.isHost}
            selfId={game.selfId}
            actions={actions}
            customWords={game.customWords}
            customTopic={game.customTopic}
          />
        )}
        {game.stage === 'preround' && (
          <PreRound
            speaker={speaker}
            listener={listener}
            teams={game.teams}
            players={game.players}
            settings={game.settings}
            selfId={game.selfId}
            currentTeamId={game.round.currentTeamId}
            isHost={game.isHost}
            actions={actions}
            readyMap={game.round.readyMap}
            activeChallenge={game.round.activeChallenge}
          />
        )}
        {['play', 'play-adjustment'].includes(game.stage) && (
          <Game
            stage={game.stage}
            speaker={speaker}
            listener={listener}
            timeLeft={game.round.timeLeft}
            word={game.round.currentWord}
            isHost={game.isHost}
            selfId={game.selfId}
            isPaused={!game.round.running}
            currentTeamId={game.round.currentTeamId}
            wordLog={game.round.wordLog}
            actions={actions}
          />
        )}
        {game.stage === 'victory' && (
          <Victory
            winner={winner}
            players={game.players}
            backToLobby={actions.backToLobby}
          />
        )}
      </main>
    </div>
  );
}

export default App;
