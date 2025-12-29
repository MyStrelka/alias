import { useEffect, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';

import type { Player } from '@alias/shared';

import Header from './layout/Header';
import Game from './layout/Pages/Game';
import Lobby from './layout/Pages/Lobby';
import Login from './layout/Pages/Login';
import PreRound from './layout/Pages/PreRound';
import Victory from './layout/Pages/Victory';
import { useGameStore } from './store/gameStore';

import './index.css';

import Bubbles from './components/Bubbles';
import MessageListener from './components/MessageListener';
import Main from './layout/Main';
import Modal from './layout/Modals/Modal';
import Page from './layout/Page';
import Sidebar from './layout/Sidebar';
import LeaderBoard from './layout/Sidebar/LeaderBoard';
import CurrentPlayers from './layout/Sidebar/Players';

function App() {
  const game = useGameStore();
  const { actions, roomId, round } = game;

  useEffect(() => {
    if (roomId) {
      actions.joinRoom(roomId);
    }
  }, []);

  const speaker = useMemo(
    () => game.players.find((p: Player) => p.id === round.speakerId),
    [game.players, game.round.speakerId],
  );
  const listener = useMemo(
    () => game.players.find((p: Player) => p.id === round.listenerId),
    [game.players, round.listenerId],
  );

  const isSpeakerReady = !!round.readyMap[speaker?.id || ''];
  const isListenerReady = !!round.readyMap[listener?.id || ''];

  const winner = useMemo(() => {
    if (game.settings.mode === 'team')
      return game.teams.find((t) => t.id === game.victory?.winnerId);
    return game.players.find((p) => p.id === game.victory?.winnerId);
  }, [game.victory?.winnerId, game.settings.mode, game.teams, game.players]);

  return (
    <div className='min-h-screen w-full relative overflow-x-hidden text-text-main font-sans selection:bg-accent-main/30'>
      <Modal />
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
      <Bubbles />
      <MessageListener />
      <Header />
      <Main>
        <Page>
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
              settings={game.settings}
              selfId={game.selfId}
              currentTeamId={game.round.currentTeamId}
              actions={actions}
              readyMap={game.round.readyMap}
              activeChallenge={game.round.activeChallenge}
              isSpeakerReady={isSpeakerReady}
              isListenerReady={isListenerReady}
            />
          )}
          {['play', 'play-adjustment'].includes(game.stage) && (
            <Game
              stage={game.stage}
              speaker={speaker}
              listener={listener}
              timeLeft={game.round.timeLeft}
              word={game.round.currentWord}
              selfId={game.selfId}
              isPaused={!game.round.running}
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
        </Page>
        {['preround', 'play', 'play-adjustment'].includes(game.stage) && (
          <Sidebar>
            {['play', 'play-adjustment'].includes(game.stage) && (
              <CurrentPlayers
                speaker={speaker}
                listener={listener}
                isSpeakerReady={isSpeakerReady}
                isListenerReady={isListenerReady}
              />
            )}
            <LeaderBoard speaker={speaker} listener={listener} />
          </Sidebar>
        )}
      </Main>
    </div>
  );
}

export default App;
