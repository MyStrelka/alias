import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  Settings,
  Play,
  XCircle,
  Shuffle,
  Share2,
  Sparkles,
  Trash2,
} from 'lucide-react';

import type {
  Player,
  Team,
  Mode,
  GameStateClient,
  GameStateActions,
  Settings as AliasSettings,
} from '@alias/shared';
import { soundManager } from '../utils/soundManager';
import Tile from '../components/Tile';
import PlayerTable from '../components/PlayerTable';
import TeamsSection from '../components/TeamsSection';
import AccentButton from '../components/AccentButton';

const Lobby = ({
  settings,
  players,
  teams,
  isHost,
  selfId,
  roomId,
  actions,
  customWords,
  customTopic,
}: {
  settings: AliasSettings;
  players: Player[];
  teams: Team[];
} & Pick<
  GameStateClient,
  'isHost' | 'selfId' | 'roomId' | 'customWords' | 'customTopic'
> &
  GameStateActions) => {
  const [topic, setTopic] = useState('');
  const isTeamMode = settings.mode === 'team';
  const canStartGame =
    players.length >= 2 &&
    (!isTeamMode ||
      teams.filter((t: Team) => t.playerIds.length >= 2).length >= 2);
  const teamValidationError =
    isTeamMode &&
    teams.some((t: Team) => t.playerIds.length > 0 && t.playerIds.length < 2);
  const displayRoomId = roomId?.replace('alias-', '') || '...';

  const gameModes: { value: Mode; label: string }[] = [
    { value: 'team', label: 'Команды' },
    { value: 'solo_standard', label: 'Соло (Std)' },
    { value: 'solo_all_vs_all', label: 'Соло (All)' },
  ];

  return (
    <div className='grid grid-cols-1 xl:grid-cols-[360px,1fr] gap-6 animate-fade-in'>
      <div className='glass-panel p-5 space-y-6 h-fit'>
        <div className='flex items-center justify-between border-b border-white/10 pb-4'>
          <div>
            <p className='text-xs text-gray-500 uppercase font-bold'>
              Код комнаты
            </p>
            <div className='flex items-center gap-3'>
              <h2 className='text-4xl font-mono font-black text-accent-main tracking-widest mt-1 select-all'>
                {displayRoomId}
              </h2>
              {isHost && (
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/?room=${displayRoomId}`;
                    navigator.clipboard.writeText(url);
                    toast.success('Ссылка скопирована!');
                  }}
                  className='p-2 mt-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors border border-white/10'
                >
                  <Share2 className='h-6 w-6' />
                </button>
              )}
            </div>
          </div>
          <Settings className='h-6 w-6 text-gray-400' />
        </div>

        {isHost && (
          <div className='glass-panel bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-accent-main/30 p-4 -mx-5 -mt-2'>
            <div className='flex items-center gap-2 mb-2 text-accent-main font-bold text-sm uppercase'>
              <Sparkles className='h-4 w-4' /> AI Генератор слов
            </div>
            {customWords ? (
              <div className='flex items-center justify-between gap-2'>
                <div className='text-sm'>
                  <span className='text-gray-400'>Тема: </span>
                  <span className='text-white font-bold'>{customTopic}</span>
                  <div className='text-xs text-green-400 mt-1'>
                    Загружено {customWords.length} слов
                  </div>
                </div>
                <button
                  onClick={actions.clearCustomWords}
                  className='p-2 hover:bg-white/10 rounded-lg text-red-400 transition'
                >
                  <Trash2 className='h-5 w-5' />
                </button>
              </div>
            ) : (
              <div className='flex gap-2'>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder='Напр: Гарри Поттер'
                  className='input-glass text-sm w-full'
                />
                {/* 🔥 AI пока заглушка - не скрываю, но будет работать потом */}
                <button
                  onClick={() => {
                    if (!topic) return toast.error('Введите тему');
                    actions.generateWordsAI(topic);
                  }}
                  className='btn-glass bg-accent-main/20 hover:bg-accent-main/40 border-accent-main/50'
                  disabled={!topic}
                >
                  <Sparkles className='h-5 w-5 text-white' />
                </button>
              </div>
            )}
          </div>
        )}

        <div className='space-y-4 pt-2 border-t border-white/10'>
          <div>
            <label className='text-sm text-gray-400 mb-1 block'>
              Режим игры
            </label>
            <div className='mt-2 grid grid-cols-3 gap-2'>
              {gameModes.map((mode) => (
                <button
                  key={mode.value}
                  disabled={!isHost}
                  onClick={() =>
                    actions.updateSettings({ mode: mode.value as any })
                  }
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${settings.mode === mode.value ? 'border-accent-main bg-accent-main/20 text-white' : 'border-white/10 bg-white/5 text-gray-400'} ${!isHost && 'opacity-70 cursor-not-allowed'}`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className='text-sm text-gray-400 mb-1 block'>
              Сложность
            </label>
            <select
              disabled={!isHost}
              value={settings.difficulty}
              onChange={(e) =>
                actions.updateSettings({ difficulty: e.target.value as any })
              }
              className='input-glass w-full text-sm'
            >
              <option value='easy' className='text-black'>
                Легко
              </option>
              <option value='medium' className='text-black'>
                Средне
              </option>
              <option value='hard' className='text-black'>
                Сложно
              </option>
            </select>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='text-sm text-gray-400 mb-1 block'>
                Время (сек)
              </label>
              <input
                type='number'
                value={settings.roundTime}
                disabled={!isHost}
                onChange={(e) =>
                  actions.updateSettings({ roundTime: Number(e.target.value) })
                }
                className='input-glass w-full text-center font-mono'
                min={10}
                max={300}
              />
            </div>
            <div>
              <label className='text-sm text-gray-400 mb-1 block'>
                Цель (очки)
              </label>
              <input
                type='number'
                value={settings.winScore}
                disabled={!isHost}
                onChange={(e) =>
                  actions.updateSettings({ winScore: Number(e.target.value) })
                }
                className='input-glass w-full text-center font-mono'
                min={10}
                max={200}
              />
            </div>
          </div>
        </div>

        <div className='space-y-4 pt-2 border-t border-white/10'>
          <div>
            <label className='text-sm text-gray-400 mb-1 block'>
              Усложнения раунда
            </label>
            <div className='mt-2'>
              <button
                disabled={!isHost}
                onClick={() =>
                  actions.updateSettings({
                    enableChallenges: !settings.enableChallenges,
                  })
                }
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition w-full ${settings.enableChallenges ? 'border-rose-500 bg-rose-500/20 text-white' : 'border-white/10 bg-white/5 text-gray-400'} ${!isHost && 'opacity-70 cursor-not-allowed'}`}
              >
                {settings.enableChallenges ? 'Включены' : 'Выключены'}
              </button>
            </div>
          </div>
        </div>

        {isHost && (
          <div className='pt-2 border-t border-white/10'>
            <button
              onClick={actions.shuffleTeams}
              className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors'
            >
              <Shuffle className='h-4 w-4' /> Перемешать
            </button>
          </div>
        )}
      </div>

      <div className='space-y-4'>
        {settings.mode === 'team' && (
          <Tile title='Команды'>
            <TeamsSection
              teams={teams}
              players={players}
              selfId={selfId}
              onCreateTeam={() => actions.createTeam()}
              onJoinTeam={(id: string) => actions.joinTeam(id)}
              isHost={isHost}
            />
            {teamValidationError && (
              <div className='mt-3 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm flex items-center gap-2'>
                <XCircle className='h-4 w-4' /> В каждой команде должно быть
                минимум 2 игрока
              </div>
            )}
          </Tile>
        )}

        <Tile
          title='Список игроков'
          rightElement={
            <div className='text-xs font-mono bg-white/10 px-2 py-1 rounded'>
              {players.length} / 8
            </div>
          }
        >
          <PlayerTable
            players={players}
            selfId={selfId}
            isHost={isHost}
            onToggleReady={actions.toggleReady}
            onKick={actions.kickPlayer}
            gameStage='lobby'
          />
        </Tile>

        <div className='flex justify-end pt-2'>
          {isHost ? (
            <div className='flex flex-col items-end gap-3'>
              {!canStartGame && (
                <div className='text-right'>
                  <p className='text-xs text-red-400 font-bold uppercase tracking-wide mb-1'>
                    Нельзя начать игру
                  </p>
                  <p className='text-sm text-gray-400'>
                    {players.length < 2
                      ? 'Нужно минимум 2 игрока'
                      : isTeamMode
                        ? 'Минимум две команды должны иметь по ≥ 2 игрока'
                        : 'Готово к старту!'}
                  </p>
                </div>
              )}
              <AccentButton
                onClick={() => {
                  if (!canStartGame) {
                    toast.error('Соберите команды!');
                    return;
                  }
                  soundManager.play('start');
                  actions.startGame();
                }}
                disabled={!canStartGame}
                className={`px-8 py-3 text-lg ${!canStartGame ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
              >
                <Play className='h-6 w-6 fill-current' /> Начать игру
              </AccentButton>
            </div>
          ) : (
            <div className='text-gray-400 italic animate-pulse'>
              Ожидание хоста...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
