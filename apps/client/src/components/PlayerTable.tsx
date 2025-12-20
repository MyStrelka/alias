import { CheckCircle2, XCircle, Crown, UserMinus } from 'lucide-react';

import type { Player } from '@alias/shared';

const PlayerTable = ({
  players,
  selfId,
  isHost,
  onToggleReady,
  onKick,
  gameStage,
}: any) => (
  <div className='overflow-hidden rounded-xl border border-white/5 bg-black/10'>
    <table className='min-w-full text-sm text-gray-300'>
      <thead className='bg-white/5 text-xs uppercase tracking-wide text-gray-400'>
        <tr>
          <th className='px-4 py-3 text-left'>Имя</th>
          <th className='px-4 py-3 text-left'>Очки</th>
          <th className='px-4 py-3 text-left'>Статус</th>
          {isHost && <th className='px-4 py-3 text-right'></th>}
        </tr>
      </thead>
      <tbody className='divide-y divide-white/5'>
        {players.map((p: Player) => (
          <tr key={p.id} className='hover:bg-white/10 transition'>
            <td className='px-4 py-3 font-semibold text-white'>
              <div className='flex items-center gap-2'>
                {p.isHost && <Crown className='h-4 w-4 text-amber-400' />}
                <span>{p.name}</span>
                {p.id === selfId && (
                  <span className='badge bg-white/20 border-white/30 text-xs'>
                    Вы
                  </span>
                )}
                {!p.online && (
                  <span className='text-[10px] text-red-400 ml-1'>
                    (offline)
                  </span>
                )}
              </div>
            </td>
            <td className='px-4 py-3 font-mono'>{p.score}</td>
            <td className='px-4 py-3'>
              {gameStage === 'lobby' ? (
                <button
                  onClick={() => onToggleReady?.(p.id)}
                  disabled={p.id !== selfId}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-semibold transition-colors ${
                    p.ready
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-white/10 text-gray-400 border border-white/10'
                  } ${p.id !== selfId ? 'cursor-default opacity-80' : 'hover:bg-opacity-80'}`}
                >
                  {p.ready ? (
                    <CheckCircle2 className='h-3 w-3' />
                  ) : (
                    <XCircle className='h-3 w-3' />
                  )}
                  {p.ready ? 'Готов' : 'Не готов'}
                </button>
              ) : (
                <span className='text-xs text-gray-400'>В игре</span>
              )}
            </td>
            {isHost && (
              <td className='px-4 py-3 text-right'>
                {!p.isHost && (
                  <button
                    onClick={() => {
                      if (confirm(`Исключить игрока ${p.name}?`))
                        onKick?.(p.id);
                    }}
                    className='p-2 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors'
                    title='Исключить'
                  >
                    <UserMinus className='h-4 w-4' />
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default PlayerTable;
