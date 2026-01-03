import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, PauseCircle, Play, XCircle } from 'lucide-react';

import CommonSettings from '../../../components/CommonSettings';
import { useGameStore } from '../../../store/games/alilasStore';
import useUiStore from '../../../store/uiStore';
import { soundManager } from '../../../utils/soundManager';
import { Layout } from '../../Layout';
import LeaderBoard from '../../Sidebar/LeaderBoard';
import CurrentPlayers from '../../Sidebar/Players';
import GameLeftBar from './LeftBar';

const Game = ({
  stage,
  speaker,
  listener,
  timeLeft,
  word,
  selfId,
  isPaused,
  actions,
  isSpeakerReady,
  isListenerReady,
}: any) => {
  const { round } = useGameStore();
  const { isSettingsOpen } = useUiStore();
  const { activeChallenge } = round;
  const isSpeaker = speaker?.deviceId === selfId;
  const isListener = listener?.deviceId === selfId;

  // 🔥 ПРАВКА: Все actions идут через стор (P2P удален)
  const handleCorrect = () => {
    soundManager.play('correct');
    actions.handleCorrect();
  };
  const handleSkip = () => {
    soundManager.play('skip');
    actions.handleSkip();
  };
  const handlePause = () => {
    actions.togglePause();
  };

  const [isLastWordClicked, setIsLastWordClicked] = useState(false);
  const [lastWord, setLastWord] = useState(false);
  useEffect(() => {
    if (stage === 'play-adjustment') {
      setLastWord(true);
    }
  }, [stage]);

  return (
    <Layout
      leftSidebar={<GameLeftBar />}
      rightSidebar={
        <>
          {isSettingsOpen && (
            <div className='glass-panel p-5 space-y-6 h-fit animate-fade-in'>
              <CommonSettings />
            </div>
          )}
          <CurrentPlayers
            speaker={speaker}
            listener={listener}
            isSpeakerReady={isSpeakerReady}
            isListenerReady={isListenerReady}
          />
          <LeaderBoard speaker={speaker} listener={listener} />
        </>
      }
    >
      <div className='flex flex-col gap-4'>
        <div className='glass-panel p-8 flex flex-col relative overflow-hidden min-h-[500px]'>
          <div className='flex justify-between items-start z-10'>
            <div className='badge bg-red-500/20 text-red-200 border-red-500/30 flex items-center gap-2 px-3 py-1'>
              <Clock3 className='h-4 w-4' />
              <span className='font-mono text-xl font-bold'>{timeLeft}s</span>
            </div>
            <button
              onClick={handlePause}
              className='btn-glass p-2 rounded-full'
            >
              {isPaused ? (
                <Play className='h-6 w-6' />
              ) : (
                <PauseCircle className='h-6 w-6' />
              )}
            </button>
          </div>

          <div className='flex-1 flex flex-col items-center justify-center z-10 py-10'>
            {activeChallenge && (
              <div className='mb-4 text-center p-3 border-2 border-rose-500/50 bg-rose-500/10 rounded-xl shadow-lg'>
                <p className='text-sm font-black text-rose-300 uppercase'>
                  🔥 ЗАДАНИЕ:
                </p>
                <p className='text-lg font-bold text-white mt-1'>
                  {activeChallenge}
                </p>
              </div>
            )}
            {isSpeaker ? (
              <>
                <div className='text-sm text-gray-400 uppercase tracking-[0.2em] mb-4'>
                  Ваше слово
                </div>
                <div className='text-5xl md:text-7xl font-black text-white text-center break-words leading-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]'>
                  {word}
                </div>
              </>
            ) : (
              <>
                <div className='text-sm text-gray-400 uppercase tracking-[0.2em] mb-4'>
                  {isListener ? 'Вы отгадываете' : 'Наблюдатель'}
                </div>
                <div className='text-3xl font-bold text-gray-300 text-center opacity-50'>
                  {isListener
                    ? 'Слушайте внимательно!'
                    : `${speaker?.name} объясняет...`}
                </div>
              </>
            )}
          </div>

          {isSpeaker && !isLastWordClicked && (
            <div className='grid grid-cols-2 gap-4 z-10 mt-auto'>
              <button
                type='button'
                onClick={() => {
                  if (lastWord) {
                    setIsLastWordClicked(true);
                  }
                  handleSkip();
                }}
                className='h-20 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xl hover:bg-red-500/20 active:scale-95 transition-all flex flex-col items-center justify-center disabled:opacity-50'
                disabled={isPaused}
              >
                <XCircle className='h-6 w-6 mb-1' />
                Пропустить (-1)
              </button>
              <button
                onClick={() => {
                  if (lastWord) {
                    setIsLastWordClicked(true);
                  }
                  handleCorrect();
                }}
                className='h-20 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 font-bold text-xl hover:bg-green-500/20 active:scale-95 transition-all flex flex-col items-center justify-center disabled:opacity-50'
                disabled={isPaused}
              >
                <CheckCircle2 className='h-6 w-6 mb-1' />
                Угадал (+1)
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Game;
