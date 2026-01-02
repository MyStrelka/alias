import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Play, Share2, Sparkles, Trash2, XCircle } from 'lucide-react';

import {
  SETTINGS,
  type Settings as AliasSettings,
  type GameState,
  type GameStatePlayer,
  type Mode,
  type Player,
  type Team,
} from '@seaborn/shared/alias';

import AccentButton from '../../components/AccentButton';
import CommonSettings from '../../components/CommonSettings';
import PlayerTable from '../../components/PlayerTable';
import TeamsSection from '../../components/TeamsSection';
import Tile from '../../components/Tile';
import { useGameStore } from '../../store/games/alilasStore';
import { useRootStore } from '../../store/rootStore';
import { soundManager } from '../../utils/soundManager';

const Lobby = ({
  settings,
  players,
  teams,
  isHost,
  roomId,
  customWords,
  customTopic,
}: {
  settings: AliasSettings;
  players: Player[];
  teams: Team[];
} & Pick<
  GameState & GameStatePlayer,
  'isHost' | 'roomId' | 'customWords' | 'customTopic'
>) => {
  const [topic, setTopic] = useState('');
  const { deviceId } = useRootStore();
  const { actions } = useGameStore();

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
    // { value: 'solo_all_vs_all', label: 'Соло (All)' },
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
        </div>

        {isHost && (
          <div className='glass-panel bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-accent-main/30 p-4 border-white/10 border-b'>
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
                  // onClick={actions.clearCustomWords}
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
                    // actions.generateWordsAI(topic);
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
        <CommonSettings gameModes={gameModes} />
      </div>

      <div className='space-y-4'>
        {settings.mode === 'team' && (
          <Tile title='Команды'>
            <TeamsSection
              teams={teams}
              players={players}
              onCreateTeam={() => actions.createTeam()}
              isHost={isHost}
            />
            {teamValidationError && (
              <div className='mt-3 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm flex items-center gap-2'>
                <XCircle className='h-4 w-4' /> В каждой команде должно быть
                минимум 2 игрока
              </div>
            )}{' '}
            {teams.length >= SETTINGS.MAX_TEAM_COUNT && (
              <div className='mt-3 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-200 text-sm flex items-center gap-2'>
                <XCircle className='h-4 w-4' />
                Максимум {SETTINGS.MAX_TEAM_COUNT} команд
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
            selfId={deviceId}
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
