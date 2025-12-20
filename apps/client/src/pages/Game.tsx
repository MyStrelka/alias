import {
  Trophy,
  Clock3,
  PauseCircle,
  Play,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { Player, Team } from '@alias/shared';
import { useGameStore, TEAM_THEMES } from '../store/gameStore';
import { soundManager } from '../utils/soundManager';

const Game = ({
  speaker,
  listener,
  timeLeft,
  word,
  // isHost,
  selfId,
  isPaused,
  currentTeamId,
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

  return (
    <div className='grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-6 animate-fade-in h-full'>
      <div className='glass-panel p-8 flex flex-col relative overflow-hidden min-h-[500px]'>
        <div className='flex justify-between items-start z-10'>
          <div className='badge bg-red-500/20 text-red-200 border-red-500/30 flex items-center gap-2 px-3 py-1'>
            <Clock3 className='h-4 w-4' />
            <span className='font-mono text-xl font-bold'>{timeLeft}s</span>
          </div>
          <button onClick={handlePause} className='btn-glass p-2 rounded-full'>
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

        {isSpeaker && (
          <div className='grid grid-cols-2 gap-4 z-10 mt-auto'>
            <button
              onClick={handleSkip}
              className='h-20 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-xl hover:bg-red-500/20 active:scale-95 transition-all flex flex-col items-center justify-center'
            >
              <XCircle className='h-6 w-6 mb-1' />
              Пропустить (-1)
            </button>
            <button
              onClick={handleCorrect}
              className='h-20 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 font-bold text-xl hover:bg-green-500/20 active:scale-95 transition-all flex flex-col items-center justify-center'
            >
              <CheckCircle2 className='h-6 w-6 mb-1' />
              Угадал (+1)
            </button>
          </div>
        )}
      </div>

      <div className='flex flex-col gap-4'>
        <div className='glass-panel p-4 flex items-center justify-between'>
          <span className='text-gray-400'>Объясняет</span>
          <span className='font-bold text-white'>{speaker?.name}</span>
        </div>
        <div className='glass-panel p-4 flex items-center justify-between'>
          <span className='text-gray-400'>Отгадывает</span>
          <span className='font-bold text-white'>{listener?.name}</span>
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
                    const score = teamPlayers.reduce(
                      (acc: number, p: Player) => acc + p.score,
                      0,
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
                          <span className={theme.text}>{t.name}</span>
                          <span className='font-bold text-white text-lg'>
                            {score}
                          </span>
                        </div>
                        <div className='flex flex-wrap gap-1'>
                          {teamPlayers.map((p: Player) => (
                            <span
                              key={p.id}
                              className='text-[10px] bg-black/20 px-1.5 py-0.5 rounded text-gray-300 flex gap-1'
                            >
                              {p.name}:{' '}
                              <span
                                className={
                                  p.score < 0 ? 'text-red-400' : 'text-gray-300'
                                }
                              >
                                {p.score}
                              </span>
                            </span>
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
                      <span
                        className={`text-sm ${p.id === speaker?.id ? 'text-accent-main font-bold' : 'text-gray-300'}`}
                      >
                        {p.name} {p.id === selfId && '(Вы)'}
                      </span>
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
