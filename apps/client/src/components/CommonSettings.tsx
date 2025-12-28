import { Shuffle } from 'lucide-react';

import type { Mode } from '@alias/shared';

import { useGameStore } from '../store/gameStore';

const CommonSettings = ({
  gameModes,
}: {
  gameModes?: { value: Mode; label: string }[];
}) => {
  const { isHost, actions, settings } = useGameStore();
  return (
    <>
      <div className='space-y-4 pt-2 border-white/10'>
        {gameModes && gameModes?.length > 0 && (
          <div>
            <label className='text-sm text-gray-400 mb-1 block'>
              Режим игры
            </label>
            <div className='mt-2 grid grid-cols-2 gap-2'>
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
        )}
        <div>
          <label className='text-sm text-gray-400 mb-1 block'>Сложность</label>
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
    </>
  );
};

export default CommonSettings;
