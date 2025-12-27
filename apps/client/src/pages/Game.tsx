import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  Crown,
  PauseCircle,
  Play,
  Trophy,
  XCircle,
} from 'lucide-react';

import type { Player, Team, WordLog } from '@alias/shared';

import AccentButton from '../components/AccentButton';
import EllipsisText from '../components/EllipsisText';
import KickUser from '../components/KickUser';
import Table from '../components/Table/Table';
import Td from '../components/Table/Td';
import Thead from '../components/Table/Thead';
import Trow from '../components/Table/Trow';
import { TEAM_THEMES, useGameStore } from '../store/gameStore';
import { soundManager } from '../utils/soundManager';

const Game = ({
  stage,
  speaker,
  listener,
  timeLeft,
  word,
  isHost,
  selfId,
  isPaused,
  currentTeamId,
  wordLog,
  actions,
}: any) => {
  const { players, settings, teams, round } = useGameStore();
  const { activeChallenge } = round;
  const isSpeaker = speaker?.id === selfId;
  const isListener = listener?.id === selfId;

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
    <div className='grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-6 animate-fade-in h-full'>
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

        <div className='glass-panel flex flex-col p-4'>
          <Table
            header={() => (
              <>
                <Thead
                  text={`Слова раунда (${(wordLog as WordLog[]).filter((w) => w.score === 1).length} слов отгадано)`}
                />
                <Thead text='' />
              </>
            )}
            rows={() =>
              (wordLog as WordLog[]).map((log, i) => (
                <Trow key={`word_${i}`}>
                  <Td
                    classNames={[
                      'text-right',
                      'font-bold',
                      'text-xl w-1/2',
                      log.score === -1
                        ? 'text-red-400'
                        : log.score === 1
                          ? 'text-green-400'
                          : '',
                    ]}
                  >
                    {log.word}
                  </Td>
                  <Td>
                    <input
                      type='number'
                      value={log.score}
                      onChange={(e) => {
                        const targetScore = e.target.value;
                        if (['-1', '0', '1'].includes(targetScore)) {
                          actions.wordAdjustment(i, Number(targetScore));
                        }
                      }}
                      className='input-glass w-24 text-center font-mono'
                      min={-1}
                      max={1}
                      step={1}
                      disabled={stage !== 'play-adjustment'}
                    />
                  </Td>
                </Trow>
              ))
            }
            footer={() =>
              stage === 'play-adjustment' && (
                <Trow>
                  <Td colspan={2} classNames={['text-center']}>
                    <AccentButton
                      className='flex-0'
                      onClick={actions.finishRound}
                    >
                      Завершить раунд
                    </AccentButton>
                  </Td>
                </Trow>
              )
            }
          />
        </div>
      </div>

      <div className='flex flex-col gap-4'>
        <div className='glass-panel p-4 flex items-center justify-between gap-4 text-right'>
          <span className='text-gray-400 flex-none'>Объясняет</span>
          {/* <span className='font-bold text-white'>{speaker?.name}</span> */}

          <EllipsisText
            classNames='font-bold text-white block max-w-80'
            text={speaker?.name}
          />
        </div>
        <div className='glass-panel p-4 flex items-center justify-between gap-4 text-right'>
          <span className='text-gray-400 flex-none'>Отгадывает</span>

          <EllipsisText
            classNames='font-bold text-white block max-w-80'
            text={listener?.name}
          />
        </div>

        <div className='glass-panel p-4 flex-1'>
          <h3 className='text-white font-bold mb-4 flex items-center gap-2'>
            <Trophy className='h-4 w-4 text-amber-400' /> Лидерборд
          </h3>
          <div className='space-y-3'>
            {settings.mode === 'team'
              ? teams
                  .sort((a: Team, b: Team) => b.score - a.score)
                  .map((t: Team) => {
                    const teamPlayers = players.filter(
                      (p: Player) => p.teamId === t.id,
                    );
                    const theme =
                      TEAM_THEMES[t.themeIndex % TEAM_THEMES.length];
                    const isActive = t.id === currentTeamId;
                    return (
                      <div
                        key={t.id}
                        className={`p-3 rounded-lg border ${theme.border} ${theme.bg} ${isActive ? 'ring-2 ring-white' : ''} flex flex-col`}
                      >
                        <div className='flex justify-between items-center mb-1'>
                          <EllipsisText classNames={theme.text} text={t.name} />
                          <span className='font-bold text-white text-lg'>
                            {t.score}
                          </span>
                        </div>
                        <div className='flex flex-col gap-1'>
                          {teamPlayers.map((p: Player) => (
                            <div className='flex items-center'>
                              {isHost &&
                                (p.isHost ? (
                                  <Crown className='h-4 w-4 text-amber-400 ml-[8px] mr-[8px]' />
                                ) : (
                                  <KickUser
                                    playerName={p.name}
                                    onClick={() => actions.kickPlayer(p.id)}
                                  />
                                ))}
                              <EllipsisText
                                classNames='bg-black/20 px-1.5 py-0.5 rounded text-gray-300 flex gap-1 ml-2'
                                text={`${p.name}`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
              : players
                  .slice()
                  .sort((a: Player, b: Player) => b.score - a.score)
                  .map((p: Player) => (
                    <div
                      key={p.id}
                      className={`flex justify-between items-center p-2 border-b border-white/5 last:border-0 ${p.id === speaker?.id ? 'bg-white/5 rounded' : ''}`}
                    >
                      <EllipsisText
                        classNames={`text-sm pr-2 ${p.id === speaker?.id ? 'text-accent-main font-bold' : 'text-gray-300'}`}
                        text={`${p.name}${p.id === selfId ? ' (Вы)' : ''}`}
                      />

                      <span
                        className={`font-mono font-bold ${p.score < 0 ? 'text-red-400' : 'text-white'}`}
                      >
                        {p.score}
                      </span>
                    </div>
                  ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
